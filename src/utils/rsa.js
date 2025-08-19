import JSEncrypt from 'jsencrypt'

// 공개키는 백엔드에서 내려주는 걸 세션에 저장해두거나
// 환경변수에 넣어둘 수도 있음
const PUBLIC_KEY = "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAjw0Mf/scsIw1AuClj21WbtMbemUTtxLrApjw1C+iV+KEA7n3olgLUnWl0PRwabKfD/GrLo8qDlhUyN4YYnQdFcQvolOu+yTp+mm8gH7go7m1vSYo5ugIpto31o+MVCvZ1X4mrfk8JEea/YaxQRFEcGde5JVFI6Jhz9chdlrjqnGDV3PvoQfmOayzw3BtB6jo3RO1xeNlzEWwIhrs+SQexmOuJSL53WkQ1fm8cEwTmF93bOXZ05rJouYzRxcsWk21Zk9vBlKXVA0EA+d0wmSJiBwC2N2/mm9g2NOrlrjzp1fnC6VP0jE+I9ExNaqTbfR0HZt+YghehDD4yL13fabLVQIDAQAB"

export function encryptRsa(text) {
  const encryptor = new JSEncrypt()
  encryptor.setPublicKey(PUBLIC_KEY)
  return encryptor.encrypt(text)
}
