import fs from 'fs';
import path from 'path';
import { BASE_DIR } from '../pathManager.js';
const STUDENTS_FILE = path.join(BASE_DIR, 'students.json');
export function loadStudents() {
    try {
        const raw = fs.readFileSync(STUDENTS_FILE, 'utf-8');
        return JSON.parse(raw);
    }
    catch (err) {
        console.error('❌ 학생 파일 로드 중 오류:', err);
        return [{ name: null, number: null }];
    }
}
export function saveStudents(students) {
    try {
        if (hasDuplicateNumbers(students)) {
            console.error('❌ 중복된 번호가 존재합니다.');
            return false;
        }
        fs.writeFileSync(STUDENTS_FILE, JSON.stringify(students, null, 2), 'utf-8');
        return true;
    }
    catch (err) {
        console.error('❌ 학생 파일 저장 중 오류:', err);
        return false;
    }
}
function hasDuplicateNumbers(students) {
    const seen = new Set();
    for (const student of students) {
        if (student.number === null)
            continue;
        if (seen.has(student.number)) {
            return true;
        }
        seen.add(student.number);
    }
    return false;
}
