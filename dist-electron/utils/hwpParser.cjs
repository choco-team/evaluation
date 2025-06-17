const fs = require('fs/promises');
const path = require('path');
const os = require('os');
const hwp = require('node-hwp');


async function parseHwpBuffer(buffer) {
  const tempDir = os.tmpdir();
  const tempPath = path.join(tempDir, `temp-${Date.now()}.hwp`);

  try {
    await fs.writeFile(tempPath, buffer);

    const reader = new hwp.HWP();
    await new Promise((resolve, reject) => {
      reader.loadFromHWP(tempPath, (err) => {
        if (err) reject(err);
        else resolve();
      }, {}); // ✅ 여기 빈 객체 추가
    });

    const documentText = reader.toHML();
    
    const textWithLineBreaks = documentText
  .replace(/<\/P>/g, '\n')    // </P>마다 줄바꿈
  .replace(/<[^>]+>/g, '')    // 그 외 모든 태그 제거
  .replace(/[ \t]+/g, ' ')    // 탭/스페이스 정리
  .replace(/\n\s*/g, '\n')    // 줄바꿈 뒤쪽 공백 정리
  .trim();

console.log(textWithLineBreaks);

    return textWithLineBreaks || '';
  } finally {
    await fs.unlink(tempPath).catch(() => {});
  }
}

module.exports = { parseHwpBuffer };
