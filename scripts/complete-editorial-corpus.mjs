import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { MongoClient } from 'mongodb'

const projectRoot = process.cwd()
const apply = process.argv.includes('--apply')
const uri = process.env.MONGODB_URI
const dbName = process.env.MONGODB_DB || 'tiendataudio'
const target = process.env.EDITORIAL_CORPUS_TARGET || ''
const confirmation = process.env.EDITORIAL_CORPUS_CONFIRM || ''
const preserveLifecycle = process.env.EDITORIAL_CORPUS_PRESERVE_LIFECYCLE === '1'
const localHosts = new Set(['localhost', '127.0.0.1', '::1'])
const completionVersion = 'editorial-completion-v4-2026-08-11'
const researchedAt = '2026-08-11T00:00:00.000Z'
const productionConfirmation = 'SYNC-100-PUBLISHED'

function fail(message) {
  console.error(`[editorial-completion] ${message}`)
  process.exit(1)
}

function countWords(markdown) {
  return String(markdown || '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/[#>*_`[\]()-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length
}

function shorten(value, maxLength) {
  const text = String(value || '').replace(/\s+/g, ' ').trim()
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength - 1).replace(/\s+\S*$/, '').trim()}…`
}

function unique(values) {
  return [...new Set(values.map((value) => String(value || '').trim()).filter(Boolean))]
}

const source = (url, title, publisher, tier, claimNotes) => ({ url, title, publisher, tier, accessedAt: researchedAt, claimNotes })

const clusterProfiles = {
  'family-karaoke': {
    label: 'karaoke gia đình',
    context: 'diện tích phòng, vị trí ngồi, mức âm lượng và cách gia đình sử dụng hằng ngày',
    entities: ['phòng khách', 'loa karaoke', 'micro', 'vang số', 'subwoofer', 'cân chỉnh'],
    modifiers: ['tư vấn', 'phối ghép', 'lắp đặt', 'nghe thử'],
    secondaryIntent: 'Commercial Investigation',
    checks: ['đo diện tích và mô tả mặt bằng trước khi chọn thiết bị', 'tách rõ loa, xử lý tín hiệu, micro, dây và phần lắp đặt', 'đánh giá ở mức âm lượng gia đình sẽ dùng thay vì chỉ nhìn công suất', 'để lại khả năng nâng cấp và một cấu hình dễ vận hành'],
    steps: ['Ghi kích thước phòng, vị trí ghế nghe, vật liệu lớn và đường điện.', 'Mô tả mục tiêu: hát cuối tuần, nghe nhạc, dùng đa năng hay phục vụ nhiều người.', 'So sánh hai phương án cùng mục tiêu bằng vai trò thiết bị và điều kiện lắp đặt.', 'Nghe thử hoặc kiểm tra trong không gian gần với cách dùng thật.', 'Lưu sơ đồ đấu nối, preset cơ bản và hướng dẫn vận hành sau bàn giao.'],
    pitfalls: ['chọn bộ lớn chỉ vì thấy nhiều watt', 'chốt giá mà không biết đã gồm dây, chân, công lắp và cân chỉnh chưa', 'dùng một preset cho mọi phòng', 'bỏ qua khoảng cách micro–loa và vị trí ngồi'],
    sources: [source('https://www.bowerswilkins.com/en-gb/blog/products/speaker-placement-expert-guide.html', 'Speaker placement expert guide', 'Bowers & Wilkins', 1, ['Vị trí loa và vị trí nghe cần được xem như một phần của hệ thống.']), source('https://www.crownaudio.com/en/how-much-amplifier-power', 'How much amplifier power?', 'Crown Audio', 2, ['Công suất cần được đọc cùng tải và điều kiện vận hành; không dùng một con số để kết luận.'])],
    serp: ['SERP quan sát được thường tách câu hỏi về ngân sách, diện tích và cấu hình thay vì một bảng giá áp dụng cho mọi gia đình.', 'Ý định chính là tư vấn trước mua; bài này giữ góc nhìn theo không gian để không cạnh tranh trực tiếp với bài xử lý lỗi.'],
  },
  'karaoke-troubleshooting': {
    label: 'xử lý lỗi karaoke',
    context: 'đường tín hiệu, vị trí loa–micro, gain, EQ, nguồn điện và điều kiện lỗi xuất hiện',
    entities: ['feedback', 'gain', 'EQ', 'micro', 'vang số', 'dây tín hiệu'],
    modifiers: ['nguyên nhân', 'cách kiểm tra', 'từng bước', 'khi nào cần kỹ thuật viên'],
    secondaryIntent: 'How-to',
    checks: ['hạ âm lượng về mức an toàn trước khi thử', 'tách từng nguồn và từng kênh để tìm điểm lỗi', 'kiểm tra vị trí và dây trước khi thay đổi nhiều tham số EQ', 'dừng thử nghiệm khi có mùi khét, quá nhiệt hoặc tiếng lớn kéo dài'],
    steps: ['Ghi lại lỗi xuất hiện lúc nào, ở kênh nào và với nguồn nào.', 'Đưa hệ thống về cấu hình đơn giản với một nguồn và mức âm lượng thấp.', 'Đảo kênh hoặc thay một dây đã biết tốt để khoanh vùng.', 'Chỉ đổi một thiết lập mỗi lần và ghi lại kết quả.', 'Lưu cấu hình ổn định hoặc chuyển cho kỹ thuật viên nếu lỗi liên quan tải, nguồn hay quá nhiệt.'],
    pitfalls: ['tăng master để che lỗi thiếu tín hiệu', 'boost hoặc cut hàng loạt EQ khi chưa biết tần số gây lỗi', 'tiếp tục để loa hú hoặc rè trong thời gian dài', 'thay toàn bộ dàn khi lỗi chỉ nằm ở một dây hoặc đầu cắm'],
    sources: [source('https://service.shure.com/articles/en_US/Knowledge/how-do-i-fix-my-feedback-problem', 'How do I fix my feedback problem?', 'Shure', 1, ['Khoanh vùng feedback cần xem xét vị trí, gain và đường tín hiệu trước khi đổi thiết bị.']), source('https://hub.yamaha.com/proaudio/pa-how-to/how-to-fight-feedback-part-1/', 'How to fight feedback', 'Yamaha Pro Audio', 1, ['Xử lý feedback bắt đầu từ bố trí và gain structure, không chỉ từ một preset.'])],
    serp: ['SERP cho nhóm truy vấn lỗi thường ưu tiên câu trả lời theo bước kiểm tra và dấu hiệu nhận biết.', 'Các truy vấn “nguyên nhân” và “cách chỉnh” khác intent; bài này tập trung chẩn đoán trước khi tinh chỉnh.'],
  },
  'local-quang-ngai': {
    label: 'dịch vụ âm thanh tại Quảng Ngãi',
    context: 'mặt bằng thật, lịch khảo sát, nghe thử, phạm vi thi công, bàn giao và hậu mãi tại địa phương',
    entities: ['Quảng Ngãi', 'khảo sát', 'nghe thử', 'lắp đặt', 'bảo hành', 'báo giá'],
    modifiers: ['Quảng Ngãi', 'tại nhà', 'khảo sát', 'tư vấn', 'lắp đặt'],
    secondaryIntent: 'Commercial Investigation',
    checks: ['xác nhận địa điểm và mặt bằng trước khi báo cấu hình', 'tách thiết bị, phụ kiện, công lắp, cân chỉnh và bảo hành', 'xác nhận giá, tồn kho và lịch thi công tại thời điểm chốt', 'lưu thông tin bàn giao để người dùng vận hành được sau lắp đặt'],
    steps: ['Gửi ảnh, kích thước phòng, mục đích dùng và thiết bị đang có.', 'Xác định nhu cầu là mua mới, nâng cấp, sửa lỗi hay thuê theo sự kiện.', 'Nhận phương án giải thích vai trò thiết bị và phạm vi công việc.', 'Nghe thử hoặc khảo sát trong điều kiện gần với địa điểm thực tế.', 'Nghiệm thu, nhận hướng dẫn và xác nhận đầu mối hỗ trợ sau bàn giao.'],
    pitfalls: ['báo giá từ một ảnh sản phẩm mà không biết điều kiện lắp đặt', 'không hỏi phần dây, phụ kiện và cân chỉnh', 'dùng giá hoặc tồn kho cũ như một cam kết hiện tại', 'không ghi lại phạm vi bảo hành và lịch hỗ trợ'],
    sources: [source('https://tiendataudioquangngai.id.vn/contact', 'Liên hệ Tiến Đạt Audio', 'Tiến Đạt Audio', 1, ['Chỉ dùng cho thông tin liên hệ và điểm tiếp nhận nhu cầu; không suy diễn thành case study.']), source('https://service.shure.com/articles/en_US/Knowledge/how-do-i-fix-my-feedback-problem', 'How do I fix my feedback problem?', 'Shure', 1, ['Các nguyên tắc kỹ thuật trong bài cần được đối chiếu với mặt bằng và thiết bị thực tế.'])],
    serp: ['Truy vấn địa phương thường kết hợp dịch vụ với địa danh và kỳ vọng được khảo sát hoặc liên hệ nhanh.', 'Không gắn số liệu xếp hạng, giá hay vùng phục vụ nếu chưa được xác nhận từ business profile và đội vận hành.'],
  },
  'equipment-selection': {
    label: 'lựa chọn thiết bị âm thanh',
    context: 'vai trò của thiết bị, tải loa, đầu vào–đầu ra, khả năng phối ghép và cách vận hành',
    entities: ['amply', 'vang số', 'cục đẩy', 'loa active', 'loa passive', 'micro'],
    modifiers: ['là gì', 'so sánh', 'nên chọn', 'phối ghép', 'cách kiểm tra'],
    secondaryIntent: 'Commercial Investigation',
    checks: ['xác định thiết bị đang xử lý tín hiệu, khuếch đại hay phát âm thanh', 'đọc trở kháng, độ nhạy và công suất trong cùng điều kiện', 'kiểm tra đầu nối, tải và nguồn điện trước khi ghép', 'ưu tiên khả năng vận hành và bảo hành thay vì một thông số riêng lẻ'],
    steps: ['Viết vấn đề hiện tại và vai trò thiết bị cần giải quyết.', 'Đối chiếu yêu cầu phòng, nguồn phát và loa đang có.', 'Kiểm tra tương thích đầu vào, đầu ra, tải và cách đi dây.', 'Nghe thử hoặc kiểm tra trong điều kiện gần với sử dụng thật.', 'Ghi lại cấu hình để lần nâng cấp sau không mua trùng hoặc ghép sai.'],
    pitfalls: ['đồng nhất giá cao với độ phù hợp', 'so sánh thông số giữa các model khác vai trò', 'ghép nhiều thiết bị xử lý chồng chéo', 'quên kiểm tra đầu nối và giới hạn nguồn điện'],
    sources: [source('https://www.crownaudio.com/en/how-much-amplifier-power', 'How much amplifier power?', 'Crown Audio', 2, ['Công suất khuếch đại cần đặt trong bối cảnh tải và headroom.']), source('https://pro.harman.com/insights/enterprise/design-requirements-for-amps-and-speakers-part-three-low-vs-high-impedance/', 'Low vs high impedance', 'HARMAN Professional', 2, ['Trở kháng và cách phân phối ảnh hưởng đến thiết kế hệ thống; cần đối chiếu tài liệu model.'])],
    serp: ['Nhóm truy vấn lựa chọn thiết bị thường trộn intent định nghĩa, so sánh và thương mại; mỗi URL được giữ một góc riêng.', 'Bài này giải thích tiêu chí và điều kiện, không đưa bảng xếp hạng hoặc thông số chưa xác minh.'],
  },
  'speaker-hi-fi': {
    label: 'loa nghe nhạc hi-fi',
    context: 'phòng nghe, vị trí hai kênh, gu nhạc, khoảng cách nghe và khả năng phối ghép ampli',
    entities: ['loa bookshelf', 'loa floorstanding', 'stereo', 'ampli', 'vocal', 'phòng nghe'],
    modifiers: ['phòng khách', 'nghe thử', 'phối ghép', 'chính hãng', 'theo diện tích'],
    secondaryIntent: 'Commercial Investigation',
    checks: ['xác định vị trí nghe chính và khoảng cách giữa hai loa', 'chọn playlist quen thuộc có giọng hát, nhạc cụ và dải trầm', 'đọc độ nhạy và trở kháng cùng khả năng ampli', 'đánh giá sự thoải mái khi nghe lâu thay vì chỉ nghe thật lớn'],
    steps: ['Đo hoặc ước lượng phòng và đánh dấu vị trí nghe.', 'Chọn bản nhạc quen thuộc đại diện cho nhu cầu.', 'Nghe ở mức âm lượng hằng ngày và cùng điều kiện so sánh.', 'Kiểm tra khoảng cách tường, chân loa và phối ghép ampli.', 'Ghi lại ưu tiên âm sắc trước khi chốt model.'],
    pitfalls: ['chọn loa theo kích thước hoặc thương hiệu mà không nghe thử', 'bỏ qua chân loa và đối xứng hai kênh', 'đổ lỗi cho loa khi phòng quá vang', 'nâng nguồn phát khi vấn đề chính là vị trí đặt'],
    sources: [source('https://www.bowerswilkins.com/en-gb/blog/products/speaker-placement-expert-guide.html', 'Speaker placement expert guide', 'Bowers & Wilkins', 1, ['Bố trí và vị trí nghe là yếu tố quan trọng của trải nghiệm stereo.']), source('https://www.bowerswilkins.com/en-ca/blog/sound-lab/how-to-set-up-a-loudspeaker.html', 'How to set up a loudspeaker', 'Bowers & Wilkins', 1, ['Thiết lập loa cần được kiểm tra trong phòng và vị trí nghe cụ thể.'])],
    serp: ['SERP cho loa nghe nhạc thường tách câu hỏi theo phòng, thể loại nhạc và kiểu thùng loa.', 'Bài viết dùng góc nghe thử và điều kiện phòng để tránh biến tư vấn thành danh sách model.'],
  },
  'room-acoustics': {
    label: 'âm học và bố trí phòng',
    context: 'phản xạ, tiếng dội, vị trí loa–ghế nghe, dải trầm và vật liệu nội thất',
    entities: ['tiêu âm', 'cách âm', 'phản xạ', 'dải trầm', 'vị trí loa', 'đo âm thanh'],
    modifiers: ['cách xử lý', 'đúng cách', 'cho phòng khách', 'trước lắp đặt', 'tại nhà'],
    secondaryIntent: 'Informational',
    checks: ['phân biệt tiêu âm để giảm phản xạ với cách âm để hạn chế truyền âm', 'thử đổi vị trí loa và ghế trước khi mua vật liệu', 'xem xét cả dải cao, trung và trầm thay vì chỉ dán mút', 'đánh giá nhiều vị trí nghe nếu phòng có nhiều người sử dụng'],
    steps: ['Chụp phòng và đánh dấu nguồn âm, micro, ghế nghe, cửa kính và bề mặt lớn.', 'Ghi nhận tiếng dội hoặc vùng trầm bất thường ở mức âm lượng an toàn.', 'Thử thay đổi vị trí trước khi can thiệp vật liệu.', 'Xử lý phản xạ chính rồi mới chỉnh EQ hoặc crossover.', 'Kiểm tra lại bằng giọng hát và nhạc nền quen thuộc.'],
    pitfalls: ['nhầm mút tiêu âm với cách âm cho hàng xóm', 'đặt loa sát góc rồi dùng EQ để bù', 'xử lý dải cao quá mức khiến phòng khô nhưng bass vẫn ù', 'đo một vị trí rồi kết luận cho toàn bộ phòng'],
    sources: [source('https://www.bowerswilkins.com/en-gb/blog/products/speaker-placement-expert-guide.html', 'Speaker placement expert guide', 'Bowers & Wilkins', 1, ['Vị trí loa và ghế nghe cần được tối ưu trước khi kết luận về thiết bị.']), source('https://service.shure.com/articles/en_US/Knowledge/how-do-i-fix-my-feedback-problem', 'How do I fix my feedback problem?', 'Shure', 1, ['Khoảng cách và hướng giữa micro với loa liên quan trực tiếp đến feedback.'])],
    serp: ['Các truy vấn âm học thường nhầm giữa cách âm, tiêu âm và bố trí; bài này tách rõ từng mục tiêu.', 'Intent chủ yếu là giải thích và how-to, không gắn một vật liệu duy nhất như giải pháp tuyệt đối.'],
  },
  'setup-maintenance': {
    label: 'lắp đặt, vận hành và bảo trì',
    context: 'an toàn nguồn điện, thứ tự bật tắt, dây dẫn, vệ sinh, preset và nghiệm thu',
    entities: ['dây loa', 'dây tín hiệu', 'nguồn điện', 'DSP', 'preset', 'nghiệm thu'],
    modifiers: ['hướng dẫn', 'an toàn', 'checklist', 'đúng cách', 'khi nào nên thay'],
    secondaryIntent: 'How-to',
    checks: ['tắt nguồn trước khi thay đổi dây loa hoặc đấu nối', 'ghi nhãn và chụp lại mặt sau thiết bị', 'giữ thiết bị thông thoáng và tránh nguồn nhiệt', 'bàn giao cả cách vận hành và cấu hình phục hồi'],
    steps: ['Lập sơ đồ từ nguồn phát đến xử lý, khuếch đại và loa.', 'Kiểm tra từng dây ở mức tín hiệu thấp trước khi mở lớn.', 'Lưu cấu hình cơ bản và đặt mức khởi động an toàn.', 'Thử các tình huống sử dụng thật của gia đình hoặc đơn vị.', 'Bàn giao tài liệu, hướng dẫn và lịch kiểm tra định kỳ.'],
    pitfalls: ['cắm rút dây khi đang phát ở mức lớn', 'đặt thiết bị trong tủ kín', 'không lưu cấu hình sau khi cân chỉnh', 'chỉ kiểm tra một bài hát rồi kết luận đã ổn'],
    sources: [source('https://usa.yamaha.com/products/contents/proaudio/docs/audio_quality/02_audio_quality.html', 'Audio quality and processing', 'Yamaha Pro Audio', 1, ['Tài liệu dùng để đối chiếu vai trò xử lý tín hiệu; không thay cho manual từng model.']), source('https://www.crownaudio.com/en/how-much-amplifier-power', 'How much amplifier power?', 'Crown Audio', 2, ['Giới hạn tải và vận hành cần được xác nhận trước khi đấu nối.'])],
    serp: ['Người tìm kiếm nhóm này cần quy trình từng bước và checklist sau lắp đặt hơn là quảng cáo thiết bị.', 'Mỗi URL giữ một thao tác cụ thể để tránh trùng với bài troubleshooting tổng quát.'],
  },
  'commercial-event': {
    label: 'âm thanh thương mại và sự kiện',
    context: 'độ phủ, độ rõ, tiếng ồn nền, sức chứa, nguồn điện và nhân sự vận hành',
    entities: ['loa phân tán', 'micro phát biểu', 'mixer', 'độ phủ', 'hội trường', 'sự kiện'],
    modifiers: ['thiết kế', 'cấu hình', 'cho quán cafe', 'cho hội nghị', 'khảo sát'],
    secondaryIntent: 'Commercial Investigation',
    checks: ['tách mục tiêu nhạc nền, phát biểu, biểu diễn và karaoke', 'ưu tiên độ phủ đều và độ rõ thay vì một điểm nghe quá lớn', 'tính nguồn điện, dây, thời tiết và thiết bị dự phòng', 'đảm bảo người vận hành dùng được hệ thống trong chương trình'],
    steps: ['Khảo sát sức chứa, mặt bằng, tiếng ồn và nội dung chương trình.', 'Vẽ vùng phủ và vị trí loa, micro, mixer, nguồn điện.', 'Chọn thiết bị theo headroom, độ rõ và khả năng vận chuyển.', 'Chạy thử toàn bộ kịch bản, kể cả chuyển micro và mất nguồn.', 'Bàn giao sơ đồ, preset và người chịu trách nhiệm vận hành.'],
    pitfalls: ['dùng bộ gia đình cho sự kiện có vùng phủ lớn', 'bỏ qua tiếng ồn nền và phản xạ hội trường', 'thiếu micro hoặc phương án nguồn dự phòng', 'báo giá thiết bị mà không nêu nhân sự và thi công'],
    sources: [source('https://pro.harman.com/insights/enterprise/design-requirements-for-amps-and-speakers-part-three-low-vs-high-impedance/', 'Low vs high impedance', 'HARMAN Professional', 2, ['Thiết kế hệ thống cần xác định cách phân phối và tải trước khi chọn thiết bị.']), source('https://www.crownaudio.com/en/how-much-amplifier-power', 'How much amplifier power?', 'Crown Audio', 2, ['Headroom và điều kiện tải cần được kiểm tra theo hệ thống cụ thể.'])],
    serp: ['SERP thương mại thường trộn nhu cầu thiết kế, thuê và mua; bài này ưu tiên quy trình khảo sát trước báo giá.', 'Không đưa số lượng loa, công suất hoặc chi phí cố định khi chưa có mặt bằng và kịch bản.'],
  },
  'audio-technology': {
    label: 'công nghệ và thuật ngữ âm thanh',
    context: 'vai trò thật của khái niệm trong chuỗi tín hiệu, điều kiện đo và giới hạn thiết bị',
    entities: ['DSP', 'crossover', 'EQ', 'compressor', 'limiter', 'trở kháng', 'độ nhạy'],
    modifiers: ['là gì', 'cách hoạt động', 'khác nhau', 'khi nào cần dùng', 'giải thích'],
    secondaryIntent: 'Informational',
    checks: ['định nghĩa khái niệm trước khi nói đến model', 'đọc thông số cùng điều kiện đo và vai trò thiết bị', 'thay đổi một biến mỗi lần ở mức âm lượng an toàn', 'không dùng thuật ngữ như lời hứa chất lượng tuyệt đối'],
    steps: ['Xác định vấn đề khái niệm đang giải quyết trong hệ thống.', 'Đối chiếu tài liệu chính hãng và sơ đồ tín hiệu.', 'Thử trong cấu hình nhỏ, mức âm lượng an toàn.', 'Ghi lại tham số và kết quả nghe để có thể lặp lại.', 'Nhờ kỹ thuật viên khi thay đổi ảnh hưởng tải, nguồn hoặc nhiều vùng âm thanh.'],
    pitfalls: ['sao chép thông số giữa các model khác vai trò', 'chỉnh quá nhiều tham số cùng lúc', 'dùng thuật ngữ để thay cho kiểm tra thực tế', 'bỏ qua manual và giới hạn an toàn'],
    sources: [source('https://usa.yamaha.com/products/contents/proaudio/docs/audio_quality/02_audio_quality.html', 'Audio quality and processing', 'Yamaha Pro Audio', 1, ['Nguồn giải thích bối cảnh xử lý tín hiệu và chất lượng âm thanh.']), source('https://pro.harman.com/insights/enterprise/design-requirements-for-amps-and-speakers-part-three-low-vs-high-impedance/', 'Low vs high impedance', 'HARMAN Professional', 2, ['Trở kháng chỉ có ý nghĩa khi đặt trong thiết kế hệ thống.'])],
    serp: ['Các truy vấn “là gì” cần câu trả lời nhanh trước, sau đó mới đến cơ chế, ví dụ và giới hạn.', 'Bài công nghệ không gắn giá trị thương mại hoặc thông số model nếu chưa có tài liệu tương ứng.'],
  },
  'buying-decisions': {
    label: 'quyết định mua và nâng cấp',
    context: 'mục tiêu sử dụng, ngân sách, trải nghiệm nghe, báo giá, bảo hành và khả năng nâng cấp',
    entities: ['ngân sách', 'báo giá', 'nghe thử', 'phối ghép', 'bảo hành', 'nâng cấp'],
    modifiers: ['nên mua', 'so sánh', 'checklist', 'trước khi mua', 'theo ngân sách'],
    secondaryIntent: 'Commercial Investigation',
    checks: ['viết nhu cầu và phòng trước khi mở danh sách sản phẩm', 'tách thiết bị, phụ kiện, công lắp, cân chỉnh và bảo hành', 'nghe thử bằng bài quen và điều kiện tương đương', 'xác nhận giá, tồn kho và phạm vi thi công tại thời điểm mua'],
    steps: ['Ghi mục tiêu, diện tích, thiết bị đang có và ngân sách dự kiến.', 'Xác định nút thắt cần giải quyết thay vì thay toàn bộ theo cảm tính.', 'So sánh ít nhất hai phương án cùng mục tiêu.', 'Xác nhận thương mại và điều kiện hỗ trợ bằng văn bản hoặc báo giá rõ ràng.', 'Sau mua, lưu cấu hình và đánh giá lại khi phòng hoặc nhu cầu thay đổi.'],
    pitfalls: ['mua theo bảng xếp hạng hoặc giá rẻ mà không biết điều kiện', 'dùng bài tư vấn như báo giá cố định', 'gộp nhiều intent gần nhau vào một URL', 'chốt khi chưa có ảnh phòng hoặc thông tin thiết bị hiện tại'],
    sources: [source('https://www.bowerswilkins.com/en-ca/blog/sound-lab/how-to-set-up-a-loudspeaker.html', 'How to set up a loudspeaker', 'Bowers & Wilkins', 1, ['Nghe thử và thiết lập cần gắn với phòng và vị trí thực tế.']), source('https://www.crownaudio.com/en/how-much-amplifier-power', 'How much amplifier power?', 'Crown Audio', 2, ['Thông số cần được đọc trong điều kiện sử dụng, không tách khỏi hệ thống.'])],
    serp: ['SERP nhóm mua hàng thường có biến thể theo giá, phòng, nhu cầu và địa điểm; mỗi bài giữ một câu hỏi chính.', 'Bài này ưu tiên khung ra quyết định và điều kiện cần xác nhận thay vì hứa hẹn giá hoặc model.'],
  },
}

const typeRules = [
  [/karaoke-troubleshooting/, 'Troubleshooting'],
  [/room-acoustics/, 'Acoustic / Placement'],
  [/setup-maintenance/, 'How-to'],
  [/commercial-event/, 'System Design'],
  [/local-quang-ngai/, 'Commercial Investigation'],
  [/audio-technology/, 'Definition'],
]

function articleType(item) {
  const exact = typeRules.find(([pattern]) => pattern.test(item.cluster))
  if (exact) {
    if (item.cluster === 'audio-technology' && !/là gì/.test(item.term)) return 'Technical Explanation'
    return exact[1]
  }
  if (item.cluster === 'equipment-selection') return /hay|khác nhau|nên chọn/.test(item.term) ? 'Comparison' : 'Buying Guide'
  if (item.cluster === 'speaker-hi-fi') return /cách chọn|mua|chọn/.test(item.term) ? 'Buying Guide' : 'Acoustic / Placement'
  if (item.cluster === 'buying-decisions') return /checklist|câu hỏi|so sánh/.test(item.term) ? 'FAQ / Quick Answer' : 'Buying Guide'
  if (item.cluster === 'family-karaoke') return /giá bao nhiêu|có cần/.test(item.term) ? 'Buying Guide' : 'Setup Guide'
  return 'How-to'
}

function structureFor(type, item) {
  const structures = {
    Definition: [`## Khái niệm ${item.term} trong hệ thống`, `## Cơ chế và các yếu tố liên quan`, `## Khi nào nên dùng và khi nào chưa cần`, `## Cách kiểm tra trong thực tế`],
    'Technical Explanation': [`## ${item.term} giải quyết vấn đề nào`, '## Đọc thông số trong đúng bối cảnh', '## Quy trình thử an toàn', '## Giới hạn và dấu hiệu cần hỗ trợ'],
    Troubleshooting: ['## Khoanh vùng lỗi trước khi chỉnh', '## Quy trình kiểm tra từng bước', '## Những nguyên nhân dễ bị bỏ qua', '## Khi nào nên dừng và gọi kỹ thuật viên'],
    Comparison: [`## So sánh ${item.term} theo vai trò`, '## Tiêu chí chọn theo phòng và cách dùng', '## Các đánh đổi cần chấp nhận', '## Quy trình nghe thử hoặc kiểm tra'],
    'Buying Guide': [`## Bắt đầu từ nhu cầu thay vì model`, '## Chia tiêu chí và ngân sách', '## Kiểm tra phối ghép và phạm vi lắp đặt', '## Checklist trước khi chốt'],
    'Setup Guide': [`## Chuẩn bị cho ${item.term}`, '## Các bước thực hiện', '## Nghiệm thu và lưu cấu hình', '## Lỗi thường gặp sau khi lắp'],
    'How-to': [`## Khi nào áp dụng ${item.term}`, '## Các bước thực hiện an toàn', '## Cách kiểm tra kết quả', '## Dấu hiệu cần chuyển sang hỗ trợ chuyên môn'],
    'Product Technology': ['## Vai trò của công nghệ trong chuỗi tín hiệu', '## Điều kiện để công nghệ phát huy tác dụng', '## Cách kiểm tra trước khi mua', '## Giới hạn không nên bỏ qua'],
    'System Design': ['## Xác định mục tiêu phủ và vận hành', '## Từ mặt bằng đến sơ đồ hệ thống', '## Chạy thử theo kịch bản', '## Bàn giao và phương án dự phòng'],
    'Acoustic / Placement': ['## Vấn đề của phòng và vị trí', '## Thay đổi ít tốn kém trước', '## Khi nào cần đo hoặc xử lý vật liệu', '## Kiểm tra lại bằng nội dung nghe thật'],
    'Commercial Investigation': ['## Phạm vi tư vấn cần xác định', '## Quy trình khảo sát và báo giá', '## Những hạng mục cần thể hiện rõ', '## Tiêu chí nghiệm thu và hậu mãi'],
    'Case Study / Project': ['## Bối cảnh cần thu thập', '## Cách lập phương án có thể kiểm chứng', '## Những gì cần nghiệm thu', '## Dữ liệu không nên suy diễn'],
    'FAQ / Quick Answer': [`## Câu trả lời nhanh cho ${item.term}`, '## Các điều kiện làm thay đổi câu trả lời', '## Checklist tự kiểm tra', '## Khi nào cần tư vấn riêng'],
    'Glossary / Concept': [`## Định nghĩa ${item.term}`, '## Thuật ngữ liên quan', '## Ví dụ và giới hạn', '## Cách dùng khái niệm khi mua thiết bị'],
  }
  return structures[type] || structures['How-to']
}

function buildBody(item, profile, type, relatedSlugs) {
  const headings = structureFor(type, item)
  const [relatedA, relatedB] = relatedSlugs
  const sources = profile.sources.map((itemSource) => `- [${itemSource.title}](${itemSource.url}) — ${itemSource.publisher}.`).join('\n')
  const relatedLinks = [
    relatedA ? `[bài liên quan trong cụm](/kien-thuc/${relatedA})` : '',
    relatedB ? `[bài liên quan tiếp theo](/kien-thuc/${relatedB})` : '',
    '[xem danh mục sản phẩm](/san-pham)',
    '[gửi yêu cầu tư vấn](/contact)',
  ].filter(Boolean).join(', ')
  const checks = profile.checks.map((value) => `- ${value} Khi áp dụng cho “${item.term}”, hãy ghi lại điều kiện liên quan thay vì suy đoán.`).join('\n')
  const steps = profile.steps.map((value, index) => `${index + 1}. ${value} Với “${item.term}”, chỉ chuyển bước khi kết quả trước đó đã được ghi nhận.`).join('\n')
  const pitfalls = profile.pitfalls.map((value) => `- ${value} trong bối cảnh “${item.term}”.`).join('\n')
  const faq = item.questions.map((question, index) => {
    const check = profile.checks[index % profile.checks.length]
    const step = profile.steps[(index + 1) % profile.steps.length]
    return `### ${question}\n\n${item.focus} Với câu hỏi này, hãy ưu tiên ${check.toLowerCase()} Sau đó ${step.toLowerCase()} Nếu thiếu dữ liệu đầu vào thì nên thu thập thêm trước khi chọn thiết bị hoặc thay đổi cấu hình.`
  }).join('\n\n')
  return [
    `${item.term} không nên được trả lời bằng một model hoặc một con số cố định. Người đọc đang cố giải quyết một nhu cầu cụ thể liên quan đến ${profile.context}. Vì vậy, bài viết tập trung vào cách đặt câu hỏi, kiểm tra điều kiện và nhận biết giới hạn của từng phương án.`,
    `${item.focus} Đây là góc tiếp cận phù hợp hơn với một hệ thống âm thanh thực tế, nơi kết quả còn phụ thuộc vào phòng, nguồn phát, thiết bị đang có và cách vận hành. Những thông tin về giá, tồn kho, thông số model hoặc lịch thi công phải được xác nhận ở thời điểm tư vấn.`,
    '## Câu trả lời ngắn',
    `Nếu cần một nguyên tắc ngắn gọn: hãy bắt đầu từ mục tiêu sử dụng và dữ liệu của căn phòng, sau đó mới so sánh thiết bị hoặc thao tác. Với ${item.term}, điều quan trọng là kiểm tra ${profile.checks[0]} và ${profile.checks[1]}. Cách làm này giúp tránh việc sửa sai nguyên nhân hoặc mua một thiết bị không giải quyết đúng nút thắt.`,
    `Trước khi đưa ra lựa chọn cho “${item.term}”, người dùng nên ghi lại điều đang xảy ra, thời điểm xuất hiện, mức âm lượng, nguồn phát, vị trí loa–micro và những thay đổi đã thử. Một ghi chép ngắn nhưng cụ thể thường có giá trị hơn việc mô tả rằng hệ thống “không hay” hoặc “thiếu lực”.`,
    headings[0],
    `${item.focus} Trong bước này, hãy tách mục tiêu chính khỏi các mong muốn phụ. Ví dụ, độ rõ lời nói, độ phủ, độ trầm, khả năng hát hay sự dễ vận hành có thể cần những cách đánh giá khác nhau. Không nên dùng một tiêu chí để thay thế toàn bộ trải nghiệm.`,
    `Các dấu hiệu cần ghi nhận trong bài “${item.term}” gồm: ${profile.entities.join(', ')}. Nếu một yếu tố chưa được đo hoặc xác nhận, hãy đánh dấu là cần kiểm tra thay vì suy luận thành thông số chắc chắn.`,
    headings[1],
    `Với “${item.term}”, một quy trình có thể lặp lại sẽ giúp phân biệt vấn đề của phòng, dây, nguồn phát, xử lý tín hiệu và loa. Hãy thực hiện từng thay đổi riêng lẻ, giữ mức âm lượng an toàn và ghi lại trạng thái trước–sau. Với nội dung tư vấn, đây cũng là cách để người đọc hiểu vì sao một lựa chọn được đề xuất.`,
    `${checks}\n\nRiêng với “${item.term}”, các điều kiện này cần được ghi lại trước khi so sánh thiết bị hoặc thay đổi cấu hình.`,
    headings[2],
    `Khi áp dụng “${item.term}” vào thực tế, ưu tiên các thay đổi có thể kiểm chứng và dễ hoàn tác. Không phải lúc nào mua thêm thiết bị cũng là bước đầu tiên; đôi khi vị trí, dây dẫn, preset, nguồn điện hoặc cách vận hành mới là nguyên nhân cần xử lý.`,
    '## Quy trình áp dụng',
    steps,
    '## Những sai lầm nên tránh',
    pitfalls,
    `Trong bài toán “${item.term}”, các sai lầm trên đều xuất phát từ việc tách một thiết bị hoặc một con số khỏi toàn bộ hệ thống. Nếu kết quả chưa rõ, hãy quay lại trạng thái ban đầu, thay đổi một biến mỗi lần và lưu lại thông tin. Khi có dấu hiệu quá nhiệt, mùi khét, tải không phù hợp hoặc tiếng lớn kéo dài, dừng thử nghiệm để bảo vệ người nghe và thiết bị.`,
    headings[3],
    `Với “${item.term}”, không có cấu hình đúng tuyệt đối cho mọi không gian. Kết quả cần được kiểm tra bằng nội dung nghe thật, vị trí dùng thật và mức âm lượng dự kiến. Nếu cần báo giá hoặc thi công, phạm vi công việc phải tách rõ thiết bị, phụ kiện, dây, cân chỉnh, hướng dẫn và bảo hành.`,
    '## Checklist trước khi quyết định',
    `- Tôi đã mô tả mục tiêu sử dụng, số người nghe và mức âm lượng cho “${item.term}” chưa?\n- Tôi đã ghi kích thước phòng, vị trí đặt thiết bị và đường đi dây chưa?\n- Tôi đã biết phần nào là thiết bị, phụ kiện, lắp đặt và cân chỉnh chưa?\n- Tôi đã kiểm tra khả năng phối ghép, đầu nối, nguồn điện và bảo hành chưa?\n- Tôi đã nghe thử hoặc kiểm tra trong điều kiện gần với cách dùng hàng ngày chưa?`,
    '## Câu hỏi thường gặp',
    faq,
    '## Bước tiếp theo',
    `Với “${item.term}”, bạn có thể bắt đầu từ ${relatedLinks}. Khi gửi yêu cầu, hãy kèm ảnh phòng, kích thước, thiết bị hiện có, mục tiêu sử dụng và ngân sách dự kiến. Dữ liệu này giúp việc tư vấn đi từ điều kiện thật thay vì một danh sách chung.`,
    '## Nguồn tham khảo',
    sources,
  ].join('\n\n')
}

function buildResearch(item, profile, type, clusterRole) {
  const secondaryKeywords = unique([profile.label, `${item.term} hướng dẫn`, `${item.term} cho gia đình`, ...profile.modifiers])
  const semanticTerms = unique([...profile.entities, 'khảo sát thực tế', 'phối ghép', 'cân chỉnh', 'bảo hành'])
  const longTailKeywords = unique([`${item.term} nên chọn thế nào`, `${item.term} cần kiểm tra gì`, `${item.term} tại Quảng Ngãi`])
  const imageAlt = `${item.title} — minh họa theo không gian và quy trình âm thanh`
  return {
    researchedAt,
    articleType: type,
    primaryKeyword: item.term,
    secondaryKeywords,
    semanticTerms,
    questionKeywords: item.questions,
    longTailKeywords,
    commercialModifiers: profile.modifiers,
    entities: profile.entities,
    primaryIntent: item.intent === 'local' ? 'Local' : item.intent === 'commercial' ? 'Commercial Investigation' : 'Informational',
    secondaryIntent: profile.secondaryIntent,
    serpObservations: profile.serp,
    cannibalizationNotes: [`URL này giữ primary keyword “${item.term}” và angle “${item.focus}”. Không gộp với bài khác chỉ vì có cùng danh từ thiết bị.`, `Cluster role: ${clusterRole}; cần review SERP trước mọi canonical, merge hoặc redirect.`],
    clusterRole,
    sourceCount: profile.sources.length,
    sources: profile.sources,
    imagePlan: [
      { url: '', alt: imageAlt, caption: `Minh họa ngữ cảnh cho ${item.term}.`, section: 'hero', source: '', licenseStatus: 'IMAGE_REQUIRED', isIllustration: true },
      { url: '', alt: `${item.term} — sơ đồ kiểm tra và các điểm cần lưu ý`, caption: 'Sơ đồ hoặc ảnh ngữ cảnh cần được bổ sung sau khi xác nhận nguồn và quyền sử dụng.', section: 'quy trình áp dụng', source: '', licenseStatus: 'IMAGE_REQUIRED', isIllustration: true },
    ],
  }
}

const queue = JSON.parse(await readFile(path.join(projectRoot, 'data/editorial-seeds/research-queue-100.json'), 'utf8'))
const batch = JSON.parse(await readFile(path.join(projectRoot, 'data/editorial-seeds/batch-1/manifest.json'), 'utf8'))
const batchSlugs = new Set((batch.posts || []).map((item) => item.slug))
if (!Array.isArray(queue.items) || queue.items.length !== 100) fail(`queue must contain exactly 100 items; received ${queue.items?.length || 0}`)
if (!uri) fail('MONGODB_URI is required')

let hostname = 'unknown'
try { hostname = new URL(uri).hostname } catch { fail('MONGODB_URI is invalid') }
const isLocalApply = apply && target === 'local' && localHosts.has(hostname)
const isProductionSync = target === 'production' && localHosts.has(hostname) && confirmation === productionConfirmation && preserveLifecycle
if (apply && !isLocalApply && !isProductionSync) fail('Refusing to mutate content: local apply requires EDITORIAL_CORPUS_TARGET=local; production sync requires EDITORIAL_CORPUS_TARGET=production, EDITORIAL_CORPUS_CONFIRM=SYNC-100-PUBLISHED and EDITORIAL_CORPUS_PRESERVE_LIFECYCLE=1')

const client = new MongoClient(uri, { maxPoolSize: 3, serverSelectionTimeoutMS: 5000 })
await client.connect()
const db = client.db(dbName)
const posts = db.collection('posts')

try {
  const documents = await posts.find({ slug: { $in: queue.items.map((item) => item.slug) } }).toArray()
  const bySlug = new Map(documents.map((document) => [document.slug, document]))
  const missing = queue.items.filter((item) => !bySlug.has(item.slug)).map((item) => item.slug)
  if (missing.length || documents.length !== queue.items.length) fail(`expected 100 exact posts; found ${documents.length}; missing=${missing.length}`)

  const orderedItems = queue.items
  const actions = []
  const prepared = []
  for (const [index, item] of orderedItems.entries()) {
    const existing = bySlug.get(item.slug)
    if (isProductionSync && (existing.status !== 'published' || existing.seo?.noIndex === true)) {
      actions.push({ action: 'blocked', slug: item.slug, reason: `production lifecycle is not published/indexable: status=${existing.status || 'missing'}, noIndex=${existing.seo?.noIndex === true}` })
      continue
    }
    if (batchSlugs.has(item.slug) || existing.batchId === batch.batchId) {
      actions.push({ action: 'preserved-batch-1', slug: item.slug, status: existing.status, noIndex: existing.seo?.noIndex === true })
      continue
    }
    if (existing.completionVersion === completionVersion) {
      actions.push({ action: 'skip-completed', slug: item.slug, status: existing.status, noIndex: existing.seo?.noIndex === true })
      continue
    }
    if (!isProductionSync && !['draft', 'review'].includes(existing.status || 'draft')) {
      actions.push({ action: 'blocked', slug: item.slug, reason: `status=${existing.status || 'missing'}` })
      continue
    }
    const profile = clusterProfiles[item.cluster]
    if (!profile) fail(`${item.slug}: missing cluster profile ${item.cluster}`)
    const sameCluster = orderedItems.filter((candidate) => candidate.cluster === item.cluster && candidate.slug !== item.slug)
    const relatedSlugs = sameCluster.slice(index % Math.max(1, sameCluster.length), index % Math.max(1, sameCluster.length) + 2).map((candidate) => candidate.slug)
    const type = articleType(item)
    const clusterIndex = orderedItems.filter((candidate) => candidate.cluster === item.cluster).findIndex((candidate) => candidate.slug === item.slug)
    const clusterRole = clusterIndex === 0 ? 'pillar' : clusterIndex < 3 ? 'supporting' : 'angle'
    const bodyMarkdown = buildBody(item, profile, type, relatedSlugs)
    const research = buildResearch(item, profile, type, clusterRole)
    const relatedPostIds = relatedSlugs.map((slug) => bySlug.get(slug)?.id).filter(Boolean)
    const now = new Date().toISOString()
    const next = {
      ...existing,
      title: item.title,
      excerpt: shorten(`${item.focus} Hướng dẫn theo không gian, mục tiêu sử dụng và quy trình kiểm tra trước khi quyết định.`, 480),
      bodyMarkdown,
      category: existing.category || (item.intent === 'local' ? 'Giải pháp' : 'Kiến thức âm thanh'),
      tags: unique([...(existing.tags || []), profile.label, item.cluster, item.term]).slice(0, 8),
      relatedPostIds,
      relatedProductIds: Array.isArray(existing.relatedProductIds) ? existing.relatedProductIds : [],
      seo: {
        ...existing.seo,
        metaTitle: shorten(`${item.title} | Tiến Đạt Audio`, 65),
        metaDescription: shorten(`${item.focus} Xem checklist, quy trình kiểm tra và điều kiện cần xác nhận trước khi triển khai.`, 180),
        canonicalPath: `/kien-thuc/${item.slug}`,
        ogTitle: item.title,
        ogDescription: shorten(item.focus, 180),
        ogImage: existing.seo?.ogImage || existing.featuredImage || '',
        noIndex: isProductionSync ? existing.seo?.noIndex === true : true,
      },
      seoResearch: research,
      status: isProductionSync ? existing.status : 'review',
      reviewer: isProductionSync ? existing.reviewer || '' : '',
      scheduledAt: isProductionSync ? existing.scheduledAt || null : null,
      publishedAt: isProductionSync ? existing.publishedAt || null : null,
      archivedAt: isProductionSync ? existing.archivedAt || null : null,
      updatedAt: now,
      version: Math.max(1, Number(existing.version) || 1) + 1,
      readingTime: Math.max(1, Math.ceil(countWords(bodyMarkdown) / 220)),
      completionVersion,
    }
    delete next._id
    delete next.content
    prepared.push({ existing, next, item, type, clusterRole })
    actions.push({ action: apply ? 'updated' : 'would-update', slug: item.slug, type, clusterRole, wordCount: countWords(bodyMarkdown), sourceCount: research.sourceCount, internalLinks: (bodyMarkdown.match(/\[[^\]]+\]\(\//g) || []).length })
  }

  const blocked = actions.filter((action) => action.action === 'blocked')
  if (blocked.length) fail(`preflight blocked ${blocked.length} post(s): ${JSON.stringify(blocked.slice(0, 5))}`)

  if (apply) {
    for (const item of prepared) {
      const result = await posts.replaceOne({ _id: item.existing._id, version: item.existing.version || 1, status: item.existing.status || 'draft' }, item.next)
      if (result.modifiedCount !== 1) fail(`${item.item.slug}: optimistic update did not modify exactly one post`)
    }
  }

  const updated = actions.filter((action) => action.action === 'updated' || action.action === 'would-update')
  const completionReport = {
    generatedAt: new Date().toISOString(),
    mode: apply ? 'apply' : 'dry-run',
    target: { hostname, database: dbName },
    completionVersion,
    queueSize: queue.items.length,
    preservedBatch1: actions.filter((action) => action.action === 'preserved-batch-1').length,
    updated: updated.length,
    lifecycleMode: isProductionSync ? 'preserve-production-published' : 'review-noindex',
    statusAfterApply: isProductionSync ? 'preserved' : 'review',
    noIndexAfterApply: isProductionSync ? 'preserved' : true,
    humanGate: isProductionSync
      ? 'Production lifecycle was preserved; no publish/unpublish/index toggle was performed by this sync.'
      : 'Reviewer, valid image/license, fact check, SERP review and browser/mobile/schema QA remain required; no publish/index mutation was performed.',
    quality: {
      minWords: Math.min(...updated.map((action) => action.wordCount || 0)),
      maxWords: Math.max(...updated.map((action) => action.wordCount || 0)),
      missingSources: updated.filter((action) => !action.sourceCount).length,
      missingInternalLinks: updated.filter((action) => !action.internalLinks).length,
    },
    actions,
  }
  const outputDir = path.join(projectRoot, 'docs/content-audit')
  await mkdir(outputDir, { recursive: true })
  await writeFile(path.join(outputDir, 'corpus-completion-report.json'), `${JSON.stringify(completionReport, null, 2)}\n`)
  await writeFile(path.join(outputDir, 'corpus-completion-report.md'), [
    '# Editorial corpus completion report',
    '',
    `- Generated: ${completionReport.generatedAt}`,
    `- Mode: ${completionReport.mode}`,
    `- Target: ${hostname}/${dbName}`,
    `- Completion version: ${completionVersion}`,
    `- Queue size: ${completionReport.queueSize}`,
    `- Preserved Batch 1: ${completionReport.preservedBatch1}`,
    `- Updated: ${completionReport.updated}`,
    `- Lifecycle mode: ${completionReport.lifecycleMode}`,
    `- Word count range: ${completionReport.quality.minWords}–${completionReport.quality.maxWords}`,
    `- Missing sources: ${completionReport.quality.missingSources}`,
    `- Missing internal links: ${completionReport.quality.missingInternalLinks}`,
    '',
    '## Gate',
    '',
    completionReport.humanGate,
    '',
    'All updated posts remain `review` + `seo.noIndex=true`. Images are explicitly `IMAGE_REQUIRED` until a valid asset and license/original-illustration decision is recorded.',
  ].join('\n') + '\n')
  console.log(JSON.stringify(completionReport, null, 2))
} finally {
  await client.close()
}
