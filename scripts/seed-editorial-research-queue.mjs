import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { MongoClient } from 'mongodb'

const projectRoot = process.cwd()
const apply = process.argv.includes('--apply')
const uri = process.env.MONGODB_URI
const dbName = process.env.MONGODB_DB || 'tiendataudio'
const target = process.env.EDITORIAL_SEED_TARGET || ''
const confirmation = process.env.EDITORIAL_SEED_CONFIRM || ''
const productionConfirmation = 'SEED-100-DRAFT-NOINDEX'

if (!uri) {
  console.error('MONGODB_URI is required. The research queue was not run.')
  process.exit(1)
}

let hostname = 'unknown'
try {
  hostname = new URL(uri).hostname
} catch {
  console.error('MONGODB_URI is invalid. The research queue was not run.')
  process.exit(1)
}

const localHosts = new Set(['localhost', '127.0.0.1', '::1'])
if (apply) {
  const isLocalApply = target === 'local' && localHosts.has(hostname)
  const isProductionApply = target === 'production' && localHosts.has(hostname) && confirmation === productionConfirmation
  if (!isLocalApply && !isProductionApply) {
    console.error('Refusing to apply research queue: use a loopback MongoDB host; production also requires EDITORIAL_SEED_CONFIRM=SEED-100-DRAFT-NOINDEX.')
    process.exit(1)
  }
}

const readJson = async (file) => JSON.parse(await readFile(path.join(projectRoot, file), 'utf8'))
const queue = await readJson('data/editorial-seeds/research-queue-100.json')
const fallbackStrategy = await readJson('data/seo-strategy.json')
const tempImageMap = await readJson('data/editorial-seeds/temp-image-map.json')

const knownKeywordIds = {
  'dan-karaoke-gia-dinh-gia-bao-nhieu': 'kw-family-karaoke-budget',
  'loa-karaoke-bi-hu-nguyen-nhan-cach-khac-phuc': 'kw-karaoke-feedback',
  'lap-dat-dan-karaoke-gia-dinh-quang-ngai': 'kw-karaoke-quang-ngai',
}

const categoryByCluster = {
  'family-karaoke': 'Giải pháp',
  'equipment-selection': 'Kiến thức âm thanh',
  'karaoke-troubleshooting': 'Kiến thức âm thanh',
  'local-quang-ngai': 'Giải pháp',
  'speaker-hi-fi': 'Kiến thức âm thanh',
  'room-acoustics': 'Kiến thức âm thanh',
  'setup-maintenance': 'Kiến thức âm thanh',
  'commercial-event': 'Giải pháp',
  'audio-technology': 'Kiến thức âm thanh',
  'buying-decisions': 'Giải pháp',
}

const clusterProfiles = {
  'family-karaoke': {
    label: 'karaoke gia đình',
    context: 'phòng khách, phòng giải trí và thói quen sử dụng trong gia đình',
    checks: [
      'Diện tích, hình dạng phòng và vị trí ngồi quyết định vùng nghe.',
      'Loa, thiết bị xử lý, micro và dây dẫn phải được xem như một hệ thống.',
      'Mức âm lượng thực tế quan trọng hơn con số công suất trên quảng cáo.',
      'Ngân sách cần có phần cho lắp đặt, cân chỉnh và hướng dẫn sử dụng.',
    ],
    process: [
      'Ghi lại kích thước phòng, đồ nội thất, nguồn điện và đường đi dây.',
      'Mô tả cách dùng: nghe nhạc, hát cuối tuần, hát thường xuyên hay dùng đa năng.',
      'Chọn hai hoặc ba phương án cùng mục tiêu để nghe thử và so sánh.',
      'Chốt rõ thiết bị, phụ kiện, phạm vi thi công và cách bảo hành.',
      'Nghiệm thu bằng các bài hát và mức âm lượng gia đình sẽ dùng hằng ngày.',
    ],
    pitfalls: [
      'Chọn một bộ lớn chỉ vì thấy nhiều watt.',
      'Bỏ qua vị trí loa và micro vì nghĩ kỹ thuật viên sẽ chỉnh mọi thứ sau cùng.',
      'So sánh giá cuối cùng nhưng không so sánh số lượng thiết bị và phạm vi lắp đặt.',
      'Dùng một preset cho mọi phòng mà không nghe thử ở không gian thật.',
    ],
    links: [['danh mục sản phẩm', '/products'], ['tư vấn phối ghép', '/contact']],
    sources: [],
  },
  'equipment-selection': {
    label: 'lựa chọn thiết bị âm thanh',
    context: 'vai trò của từng thiết bị trong một hệ thống có thể vận hành và nâng cấp được',
    checks: [
      'Thiết bị đang nói đến xử lý tín hiệu, khuếch đại, chuyển đổi hay phát âm thanh?',
      'Trở kháng, độ nhạy, công suất liên tục và headroom phải được đọc cùng nhau.',
      'Độ dễ dùng, bảo hành và khả năng thay thế cũng là một phần của giá trị.',
      'Không nên dùng một thông số riêng lẻ để kết luận chất lượng.',
    ],
    process: [
      'Xác định thiết bị nào đang là nút thắt của hệ thống hiện tại.',
      'Đối chiếu yêu cầu phòng và nhu cầu với vai trò thật của thiết bị.',
      'Kiểm tra tương thích đầu vào, đầu ra, tải loa và cách đi dây.',
      'Nghe thử hoặc kiểm tra trong điều kiện gần với cách sử dụng thật.',
      'Ghi lại cấu hình để lần nâng cấp sau không mua trùng hoặc ghép sai.',
    ],
    pitfalls: [
      'Đồng nhất giá cao với khả năng phù hợp.',
      'Đọc thông số không có điều kiện đo hoặc không biết nó áp dụng cho thiết bị nào.',
      'Ghép nhiều thiết bị xử lý chồng chéo khiến hệ thống khó kiểm soát.',
      'Quên kiểm tra đầu nối và giới hạn nguồn điện trước khi mua.',
    ],
    links: [['danh mục thiết bị', '/products'], ['gửi nhu cầu phối ghép', '/contact']],
    sources: ['https://www.crownaudio.com/en/how-much-amplifier-power', 'https://pro.harman.com/insights/enterprise/design-requirements-for-amps-and-speakers-part-three-low-vs-high-impedance/'],
  },
  'karaoke-troubleshooting': {
    label: 'xử lý lỗi karaoke',
    context: 'một hệ thống đang có tiếng hú, rè, ù, trễ hoặc mất tín hiệu',
    checks: [
      'Tắt hoặc hạ mức âm lượng trước khi thử để tránh làm hỏng thiết bị và tai người nghe.',
      'Tách từng nguồn, kênh, micro và dây để tìm điểm lỗi thay vì chỉnh toàn bộ cùng lúc.',
      'Vị trí loa, micro và đặc tính phòng thường ảnh hưởng trước cả EQ.',
      'Nếu có mùi khét, nóng bất thường hoặc tự ngắt, cần dừng máy và kiểm tra an toàn.',
    ],
    process: [
      'Ghi lại lỗi xuất hiện lúc nào, ở kênh nào và với nguồn phát nào.',
      'Đưa hệ thống về mức âm lượng an toàn rồi chỉ mở một đường tín hiệu.',
      'Đảo kênh hoặc thay một dây đã biết tốt để phân biệt nguồn lỗi.',
      'Chỉ thay đổi một thiết lập mỗi lần và ghi lại kết quả.',
      'Lưu cấu hình ổn định trước khi tiếp tục tinh chỉnh hoặc thay thiết bị.',
    ],
    pitfalls: [
      'Tăng master để che lỗi thiếu tín hiệu.',
      'Cắt hoặc boost hàng loạt EQ mà không biết tần số nào gây vấn đề.',
      'Tiếp tục để loa hú hoặc rè trong thời gian dài.',
      'Thay toàn bộ dàn khi lỗi chỉ nằm ở một đầu cắm hoặc một kênh.',
    ],
    links: [['xem thiết bị xử lý', '/products'], ['gửi cấu hình để được hỗ trợ', '/contact']],
    sources: ['https://service.shure.com/articles/en_US/Knowledge/how-do-i-fix-my-feedback-problem', 'https://hub.yamaha.com/proaudio/pa-how-to/how-to-fight-feedback-part-1/'],
  },
  'local-quang-ngai': {
    label: 'nhu cầu âm thanh tại Quảng Ngãi',
    context: 'đặc điểm mặt bằng, nhu cầu nghe thử, khảo sát và lắp đặt tại địa phương',
    checks: [
      'Thông tin địa điểm và mặt bằng phải được xác nhận trước khi báo cấu hình.',
      'Khách hàng nên biết rõ thiết bị, phụ kiện, công lắp đặt và phần bảo hành.',
      'Tư vấn địa phương có giá trị khi giải quyết được việc khảo sát và hậu mãi.',
      'Giá, tồn kho và lịch thi công cần được xác nhận tại thời điểm chốt.',
    ],
    process: [
      'Gửi ảnh, kích thước phòng, mục đích sử dụng và ngân sách dự kiến.',
      'Xác định cần mua mới, nâng cấp hay xử lý lỗi hệ thống cũ.',
      'Nhận phương án có vai trò thiết bị và phạm vi công việc rõ ràng.',
      'Nghe thử hoặc khảo sát tại địa điểm phù hợp trước khi chốt.',
      'Nghiệm thu, nhận hướng dẫn và lưu lại cấu hình sau lắp đặt.',
    ],
    pitfalls: [
      'Chốt báo giá từ một ảnh sản phẩm mà không biết điều kiện lắp đặt.',
      'Không hỏi chi phí dây, phụ kiện và cân chỉnh.',
      'Dùng thông tin địa chỉ, số điện thoại hoặc tồn kho chưa được xác nhận.',
      'Không có người tiếp nhận hướng dẫn vận hành sau bàn giao.',
    ],
    links: [['xem sản phẩm', '/products'], ['liên hệ Tiến Đạt Audio', '/contact']],
    sources: [],
  },
  'speaker-hi-fi': {
    label: 'loa nghe nhạc hi-fi',
    context: 'trải nghiệm stereo, căn phòng và gu nghe thay vì một bảng xếp hạng tuyệt đối',
    checks: [
      'Khoảng cách nghe, vị trí loa và phản xạ phòng ảnh hưởng trực tiếp đến trải nghiệm.',
      'Độ nhạy, trở kháng và ampli cần được phối ghép cùng nhau.',
      'Bản nhạc quen thuộc giúp nghe thử có mục tiêu hơn một bài demo xa lạ.',
      'Một loa phù hợp phòng sẽ có giá trị hơn một loa vượt quá khả năng kiểm soát.',
    ],
    process: [
      'Đo hoặc ước lượng phòng và xác định vị trí nghe chính.',
      'Chọn playlist đại diện cho giọng hát, nhạc cụ và dải trầm.',
      'Nghe ở mức âm lượng dùng hằng ngày, không chỉ nghe thật lớn.',
      'Kiểm tra khoảng cách tường, chân loa và khả năng phối ghép ampli.',
      'Đánh giá sự thoải mái khi nghe lâu trước khi chốt.',
    ],
    pitfalls: [
      'Chọn loa theo kích thước hoặc thương hiệu mà không nghe thử.',
      'Bỏ qua chân loa, vị trí và đối xứng hai kênh.',
      'Dùng phòng quá vang rồi đổ lỗi hoàn toàn cho loa.',
      'Nâng thiết bị nguồn khi vấn đề chính là bố trí loa.',
    ],
    links: [['danh mục loa', '/products'], ['tư vấn theo phòng nghe', '/contact']],
    sources: ['https://www.crownaudio.com/en/how-much-amplifier-power'],
  },
  'room-acoustics': {
    label: 'âm học và bố trí phòng',
    context: 'sự tương tác giữa loa, micro, nội thất và các bề mặt phản xạ trong phòng',
    checks: [
      'Tiêu âm làm giảm phản xạ trong phòng; cách âm xử lý truyền âm qua kết cấu.',
      'Vị trí loa và ghế nghe thường là thay đổi hiệu quả nhất với chi phí thấp.',
      'Dải trầm phụ thuộc mạnh vào kích thước phòng và vị trí nguồn âm.',
      'Vật liệu nội thất nên được dùng có mục tiêu, không dán kín mọi bề mặt.',
    ],
    process: [
      'Chụp phòng từ nhiều góc và đánh dấu vị trí loa, micro, ghế nghe.',
      'Nghe hoặc đo để xác định tiếng dội, điểm trũng và vùng quá mạnh.',
      'Thử thay đổi vị trí trước khi mua thêm vật liệu hoặc thiết bị.',
      'Xử lý phản xạ chính rồi mới tinh chỉnh EQ và crossover.',
      'Kiểm tra lại với giọng hát, nhạc nền và mức âm lượng thực tế.',
    ],
    pitfalls: [
      'Nhầm mút tiêu âm với giải pháp cách âm cho hàng xóm.',
      'Đặt loa sát góc rồi tăng EQ để bù.',
      'Chỉ xử lý dải cao khiến phòng khô nhưng bass vẫn ù.',
      'Đo hoặc nghe ở một vị trí rồi kết luận cho toàn bộ phòng.',
    ],
    links: [['xem thiết bị âm thanh', '/products'], ['đặt lịch khảo sát', '/contact']],
    sources: ['https://service.shure.com/articles/en_US/Knowledge/how-do-i-fix-my-feedback-problem'],
  },
  'setup-maintenance': {
    label: 'lắp đặt, bảo trì và nghiệm thu',
    context: 'các thao tác giúp hệ thống an toàn, dễ dùng và có thể phục hồi sau này',
    checks: [
      'Tắt nguồn trước khi cắm rút dây loa hoặc thay đổi đấu nối.',
      'Ghi nhãn dây, lưu preset và chụp lại mặt sau thiết bị sau khi hoàn tất.',
      'Thông gió, nguồn điện và vệ sinh ảnh hưởng đến độ bền không kém việc chọn model.',
      'Nghiệm thu phải kiểm tra cả vận hành và hướng dẫn người dùng.',
    ],
    process: [
      'Lập sơ đồ nguồn phát, xử lý tín hiệu, khuếch đại và loa.',
      'Kiểm tra từng dây ở mức tín hiệu thấp trước khi mở lớn.',
      'Lưu cấu hình cơ bản và đặt mức âm lượng khởi động an toàn.',
      'Thử các tình huống sử dụng thật của gia đình hoặc đơn vị.',
      'Bàn giao tài liệu, hướng dẫn và kế hoạch kiểm tra định kỳ.',
    ],
    pitfalls: [
      'Cắm rút dây khi thiết bị đang phát ở mức lớn.',
      'Đặt thiết bị trong tủ kín hoặc sát nguồn nhiệt.',
      'Không lưu cấu hình sau khi kỹ thuật viên đã cân chỉnh.',
      'Chỉ kiểm tra một bài hát rồi kết luận hệ thống đã ổn.',
    ],
    links: [['xem danh mục thiết bị', '/products'], ['yêu cầu hỗ trợ kỹ thuật', '/contact']],
    sources: ['https://www.crownaudio.com/en/how-much-amplifier-power', 'https://pro.harman.com/insights/enterprise/design-requirements-for-amps-and-speakers-part-three-low-vs-high-impedance/'],
  },
  'commercial-event': {
    label: 'âm thanh thương mại và sự kiện',
    context: 'độ phủ, độ rõ, mức ồn nền, nhân sự vận hành và điều kiện địa điểm',
    checks: [
      'Mục tiêu nhạc nền khác với phát biểu, biểu diễn hoặc karaoke.',
      'Độ phủ đều thường quan trọng hơn một điểm nghe thật lớn.',
      'Nguồn điện, thời tiết, dây tín hiệu và phương án dự phòng cần tính trước.',
      'Người vận hành phải dùng được hệ thống trong thời gian chương trình.',
    ],
    process: [
      'Khảo sát sức chứa, mặt bằng, tiếng ồn và nội dung chương trình.',
      'Vẽ vùng phủ và xác định vị trí loa, micro, mixer, nguồn điện.',
      'Chọn thiết bị theo headroom, độ rõ và khả năng vận chuyển.',
      'Chạy thử toàn bộ kịch bản, kể cả chuyển micro và xử lý sự cố.',
      'Bàn giao sơ đồ, preset và người phụ trách vận hành.',
    ],
    pitfalls: [
      'Dùng loa karaoke gia đình cho sự kiện có yêu cầu phủ lớn.',
      'Bỏ qua tiếng ồn nền và phản xạ của hội trường.',
      'Thiếu micro dự phòng hoặc phương án nguồn điện.',
      'Báo giá chỉ gồm thiết bị nhưng không nói rõ nhân sự và thi công.',
    ],
    links: [['xem thiết bị âm thanh', '/products'], ['gửi yêu cầu sự kiện', '/contact']],
    sources: ['https://www.crownaudio.com/en/how-much-amplifier-power', 'https://pro.harman.com/insights/enterprise/design-requirements-for-amps-and-speakers-part-three-low-vs-high-impedance/'],
  },
  'audio-technology': {
    label: 'kiến thức kỹ thuật âm thanh',
    context: 'các khái niệm kỹ thuật được diễn giải theo cách người mua và người vận hành có thể áp dụng',
    checks: [
      'Mỗi thông số chỉ có ý nghĩa khi đặt trong điều kiện đo và vai trò thiết bị.',
      'Cài đặt đúng không thay thế được vị trí, phối ghép và nguồn phát phù hợp.',
      'Thay đổi một biến mỗi lần giúp nghe và kiểm tra có thể lặp lại.',
      'An toàn điện và giới hạn thiết bị luôn được ưu tiên hơn việc thử nghiệm.',
    ],
    process: [
      'Xác định khái niệm đang giải quyết vấn đề gì trong hệ thống.',
      'Đọc thông số cùng tài liệu của nhà sản xuất, không tách khỏi bối cảnh.',
      'Thử trong cấu hình nhỏ và mức âm lượng an toàn.',
      'Ghi lại thay đổi, kết quả nghe và điều kiện thử.',
      'Nhờ kỹ thuật viên khi việc chỉnh ảnh hưởng đến tải, nguồn hoặc nhiều vùng âm thanh.',
    ],
    pitfalls: [
      'Dùng thuật ngữ kỹ thuật như một lời hứa chất lượng.',
      'Sao chép thông số giữa các model khác vai trò.',
      'Chỉnh quá nhiều tham số cùng lúc.',
      'Bỏ qua tài liệu chính hãng và giới hạn an toàn.',
    ],
    links: [['xem thiết bị có thông số công khai', '/products'], ['hỏi kỹ thuật viên', '/contact']],
    sources: ['https://www.crownaudio.com/en/how-much-amplifier-power', 'https://pro.harman.com/insights/enterprise/design-requirements-for-amps-and-speakers-part-three-low-vs-high-impedance/'],
  },
  'buying-decisions': {
    label: 'quyết định mua và nâng cấp',
    context: 'quy trình so sánh thông tin, ngân sách, trải nghiệm nghe và khả năng phục vụ lâu dài',
    checks: [
      'Nhu cầu và căn phòng phải được viết ra trước khi mở danh sách sản phẩm.',
      'Báo giá cần tách thiết bị, phụ kiện, công lắp đặt, cân chỉnh và bảo hành.',
      'Nghe thử chỉ có ý nghĩa khi dùng bài quen và điều kiện so sánh tương đương.',
      'Một cấu hình có thể nâng cấp thường tốt hơn một combo không giải thích được vai trò.',
    ],
    process: [
      'Ghi mục tiêu, diện tích, thiết bị đang có và mức ngân sách.',
      'Chọn một keyword nhu cầu tương ứng với một trang tư vấn, không gom nhiều ý định.',
      'Đối chiếu ít nhất hai phương án cùng mục tiêu.',
      'Xác nhận giá, tồn kho, bảo hành và phạm vi thi công tại thời điểm mua.',
      'Sau mua, đo lại trải nghiệm và cập nhật cấu hình nếu phòng thay đổi.',
    ],
    pitfalls: [
      'Mua vì bảng xếp hạng hoặc con số giá rẻ mà không biết điều kiện đi kèm.',
      'Dùng bài viết tư vấn như báo giá cố định.',
      'Tạo nhiều nội dung gần giống nhau chỉ để nhắm các biến thể keyword.',
      'Xuất bản bài chưa có ảnh thật, reviewer hoặc bằng chứng trải nghiệm.',
    ],
    links: [['xem sản phẩm', '/products'], ['liên hệ để xác nhận cấu hình', '/contact']],
    sources: [],
  },
}

function shorten(value, maxLength) {
  if (value.length <= maxLength) return value
  const cut = value.slice(0, maxLength - 1).replace(/\s+\S*$/, '').trim()
  return `${cut}…`
}

function countWords(markdown) {
  return markdown.replace(/[#>*_`\[\]()\-]/g, ' ').split(/\s+/).filter(Boolean).length
}

function slugKeywordId(item) {
  return knownKeywordIds[item.slug] || item.id
}

function buildBody(item, profile) {
  const links = profile.links.map(([label, href]) => `[${label}](${href})`).join(' và ')
  const sourceNote = profile.sources.length
    ? `\n\nNguồn kỹ thuật tham khảo cho bản biên tập: ${profile.sources.map((source) => `[tài liệu gốc](${source})`).join(', ')}. Nội dung của Tiến Đạt Audio cần được đối chiếu với cấu hình và trải nghiệm thực tế trước khi xuất bản.`
    : ''
  return [
    `${item.term} là nhu cầu thường xuất hiện khi người dùng muốn giải quyết một vấn đề cụ thể về ${profile.label}. Câu trả lời không nên chỉ là một danh sách model hoặc một con số giá, vì kết quả còn phụ thuộc vào ${profile.context}.`,
    `Bản nháp này được xây dựng từ tín hiệu tìm kiếm và câu hỏi người dùng, sau đó diễn giải lại theo hướng tư vấn của Tiến Đạt Audio. Trước khi public, cần bổ sung ảnh thật, thông tin khảo sát hoặc trải nghiệm có thể kiểm chứng; không dùng nội dung này như báo giá cố định.`,
    '## Câu trả lời ngắn',
    `${item.focus} Nếu chỉ nhớ một nguyên tắc, hãy bắt đầu từ mục tiêu sử dụng và điều kiện phòng, rồi mới chọn thiết bị hoặc thao tác xử lý. Cùng một giải pháp có thể phù hợp với phòng này nhưng không phù hợp với phòng khác.`,
    '## Những điểm cần kiểm tra',
    profile.checks.map((check) => `- ${check}`).join('\n'),
    `\n\nVới câu hỏi “${item.questions[0]}”, cách làm an toàn là thu thập thông tin trước: diện tích, vị trí ngồi, nguồn phát, thiết bị đang có và lỗi xuất hiện trong điều kiện nào. Với câu hỏi “${item.questions[1]}”, cần so sánh theo vai trò và kết quả nghe thực tế thay vì dùng một tiêu chí duy nhất.`,
    '## Quy trình áp dụng vào thực tế',
    profile.process.map((step, index) => `${index + 1}. ${step}`).join('\n'),
    '\n\nQuy trình này giúp giảm quyết định cảm tính. Khi cần thay đổi nhiều thiết lập, hãy ghi lại trạng thái ban đầu và chỉ đổi một yếu tố mỗi lần. Cách ghi chép đơn giản này giúp người dùng biết thay đổi nào thực sự tạo ra cải thiện, đồng thời giúp kỹ thuật viên tiếp nhận vấn đề nhanh hơn nếu cần hỗ trợ.',
    '## Những sai lầm nên tránh',
    profile.pitfalls.map((pitfall) => `- ${pitfall}`).join('\n'),
    '\n\nMột sai lầm phổ biến là cố biến câu hỏi có nhiều điều kiện thành một công thức áp dụng cho mọi nhà. Nội dung tư vấn tốt cần nói rõ giả định, giới hạn và thời điểm cần khảo sát. Nếu giá, tồn kho, thông số hoặc lịch thi công thay đổi, trang cần được cập nhật thay vì giữ một lời hứa cũ.',
    '## Checklist trước khi quyết định',
    '- Tôi đã mô tả đúng mục đích sử dụng và mức âm lượng mong muốn chưa?',
    '- Tôi đã ghi lại kích thước phòng, vị trí đặt thiết bị và đường đi dây chưa?',
    '- Tôi đã biết phần nào là thiết bị, phần nào là phụ kiện, lắp đặt và cân chỉnh chưa?',
    '- Tôi đã kiểm tra nguồn thông tin, điều kiện bảo hành và khả năng hỗ trợ sau mua chưa?',
    '- Tôi đã nghe thử hoặc kiểm tra trong điều kiện gần với cách dùng hàng ngày chưa?',
    '## Câu hỏi thường gặp',
    `### ${item.questions[0]}`,
    `${item.focus} Vì vậy, câu trả lời nên dựa trên thông tin phòng, cách dùng và mục tiêu cụ thể. Nếu thiếu dữ liệu, hãy xem đây là câu hỏi cần khảo sát chứ không phải lý do để đoán một cấu hình.`,
    `### ${item.questions[1]}`,
    `Không có một lựa chọn đúng tuyệt đối. Hãy so sánh ít nhất hai phương án cùng mục tiêu, kiểm tra khả năng phối ghép và xác nhận các điều kiện thương mại tại thời điểm triển khai. Khi có dấu hiệu liên quan đến nguồn điện, tải loa, quá nhiệt hoặc tiếng hú kéo dài, nên dừng thử nghiệm và nhờ người có chuyên môn.`,
    '## Bước tiếp theo',
    `Bạn có thể bắt đầu từ ${links}. Khi gửi yêu cầu, hãy kèm diện tích, ảnh phòng, thiết bị hiện có và ngân sách dự kiến. Tiến Đạt Audio sẽ có cơ sở tư vấn cụ thể hơn thay vì trả lời bằng một danh sách chung. Bài viết này là bản nháp biên tập; reviewer cần kiểm tra lại fact, ảnh, sản phẩm liên quan và CTA trước khi chuyển sang trạng thái review hoặc published.`,
    sourceNote,
  ].join('\n\n')
}

if (!Array.isArray(queue.items) || queue.items.length !== 100) {
  console.error(`Research queue must contain exactly 100 items; received ${queue.items?.length || 0}.`)
  process.exit(1)
}

const now = new Date().toISOString()
const preparedPosts = queue.items.map((item) => {
  const profile = clusterProfiles[item.cluster]
  if (!profile) throw new Error(`Missing cluster profile: ${item.cluster}`)
  const keywordId = slugKeywordId(item)
  const bodyMarkdown = buildBody(item, profile)
  const featuredImage = tempImageMap.images?.[item.cluster] || '/images/sonic-hero.png'
  if (countWords(bodyMarkdown) < 600) throw new Error(`Generated body is too short: ${item.slug}`)
  return {
    id: item.id,
    title: item.title,
    slug: item.slug,
    excerpt: shorten(`${item.focus} Bài viết tập trung vào cách đánh giá thực tế và các bước nên kiểm tra trước khi quyết định.`, 480),
    bodyMarkdown,
    category: categoryByCluster[item.cluster] || 'Kiến thức âm thanh',
    tags: [profile.label, item.cluster, item.term].map((tag) => shorten(tag, 80)),
    author: 'Tiến Đạt Audio',
    reviewer: '',
    featuredImage,
    gallery: [],
    primaryKeywordId: keywordId,
    keywordIds: [keywordId],
    relatedProductIds: [],
    relatedPostIds: [],
    faqs: item.questions.map((question, index) => ({
      id: `${keywordId}-faq-${index + 1}`,
      question,
      answer: `${item.focus} Hãy đối chiếu với không gian, nhu cầu và thiết bị thực tế trước khi chốt phương án.`,
    })),
    seo: {
      metaTitle: shorten(`${item.title} | Tiến Đạt Audio`, 65),
      metaDescription: shorten(`${item.focus} Xem checklist và quy trình tư vấn trước khi mua, lắp đặt hoặc chỉnh hệ thống.`, 180),
      canonicalPath: `/kien-thuc/${item.slug}`,
      ogTitle: item.title,
      ogDescription: shorten(item.focus, 180),
      ogImage: featuredImage,
      noIndex: true,
    },
    status: 'draft',
    scheduledAt: null,
    publishedAt: null,
    archivedAt: null,
    createdAt: now,
    updatedAt: now,
    version: 1,
    readingTime: Math.max(1, Math.ceil(countWords(bodyMarkdown) / 220)),
    contentType: 'editorial',
    seedSource: `research-queue-100-v${queue.version || 1}`,
  }
})

const keywordDefinitions = queue.items.map((item) => {
  const keywordId = slugKeywordId(item)
  const profile = clusterProfiles[item.cluster]
  return {
    id: keywordId,
    term: item.term,
    intent: item.intent,
    targetPage: `/kien-thuc/${item.slug}`,
    cluster: item.cluster,
    priority: item.intent === 'local' || item.intent === 'commercial' ? 'high' : 'medium',
    notes: `Research queue ${queue.researchDate}: ${item.focus}`,
    brief: {
      audience: item.audience,
      angle: item.focus,
      questions: item.questions,
      secondaryTerms: [item.term, profile.label],
      callToAction: 'Gửi thông tin phòng và nhu cầu để được tư vấn theo cấu hình thực tế.',
    },
    isActive: true,
    updatedAt: now,
  }
})

const client = await new MongoClient(uri, { maxPoolSize: 3, serverSelectionTimeoutMS: 5000 }).connect()
const db = client.db(dbName)
const posts = db.collection('posts')
const siteSettings = db.collection('site_settings')

try {
  let inserted = 0
  let skipped = 0
  const skippedSlugs = []
  for (const post of preparedPosts) {
    const existing = await posts.findOne({ $or: [{ id: post.id }, { slug: post.slug }] }, { projection: { slug: 1, status: 1 } })
    if (existing) {
      skipped += 1
      skippedSlugs.push({ slug: post.slug, status: existing.status || 'unknown' })
      continue
    }
    if (!apply) continue
    await posts.insertOne(post)
    inserted += 1
  }

  const existingStrategy = await siteSettings.findOne({ key: 'seo_strategy' })
  const currentStrategy = existingStrategy?.value && typeof existingStrategy.value === 'object' ? existingStrategy.value : fallbackStrategy
  const currentKeywords = Array.isArray(currentStrategy.keywords) ? currentStrategy.keywords : []
  const missingKeywords = keywordDefinitions.filter((keyword, index) => {
    if (currentKeywords.some((existing) => existing?.id === keyword.id)) return false
    return keywordDefinitions.findIndex((candidate) => candidate.id === keyword.id) === index
  })
  const mergedStrategy = { ...currentStrategy, keywords: [...currentKeywords, ...missingKeywords], updatedAt: now }
  const shouldMergeStrategy = !existingStrategy || missingKeywords.length > 0
  if (apply && shouldMergeStrategy) {
    await siteSettings.updateOne(
      { key: 'seo_strategy' },
      { $set: { key: 'seo_strategy', value: mergedStrategy, updatedAt: now } },
      { upsert: true },
    )
  }

  console.log(JSON.stringify({
    mode: apply ? 'apply' : 'dry-run',
    target: { hostname, database: dbName },
    queueSize: preparedPosts.length,
    posts: { wouldInsert: apply ? inserted : preparedPosts.length - skipped, inserted, skipped, skippedSlugs: skippedSlugs.slice(0, 10) },
    seoKeywords: { uniqueInQueue: new Set(keywordDefinitions.map((keyword) => keyword.id)).size, added: missingKeywords.length, action: apply && shouldMergeStrategy ? 'merged' : 'unchanged' },
    humanGate: 'All records remain draft/noindex/reviewer-empty; no publish operation was performed.',
  }, null, 2))
} finally {
  await client.close()
}
