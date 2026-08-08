import { randomBytes, scrypt } from 'node:crypto'
import { promisify } from 'node:util'

const password = process.argv[2]
if (!password) {
  console.error('Usage: npm run db:hash-password -- "your-password"')
  process.exit(1)
}

const salt = randomBytes(16).toString('hex')
const derivedKey = await promisify(scrypt)(password, salt, 64)
console.log(`scrypt$${salt}$${Buffer.from(derivedKey).toString('hex')}`)

