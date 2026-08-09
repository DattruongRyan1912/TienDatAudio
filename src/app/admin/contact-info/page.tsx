import { permanentRedirect } from 'next/navigation'

export default function LegacyContactInfoPage() {
  permanentRedirect('/admin/settings')
}
