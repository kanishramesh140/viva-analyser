import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, "../../data");
const questionsFile = path.join(dataDir, "questions.json");

async function ensureQuestionsFile() {
    await fs.mkdir(dataDir, { recursive: true });

    try {
        await fs.access(questionsFile);
    } catch {
        await fs.writeFile(
            questionsFile,
            JSON.stringify({}, null, 2),
            "utf8"
        );
    }
}

async function readQuestions() {
    await ensureQuestionsFile();

    const content = await fs.readFile(
        questionsFile,
        "utf8"
    );

    try {
        return JSON.parse(content);
    } catch {
        return {};
    }
}

async function writeQuestions(data) {
    await ensureQuestionsFile();

    await fs.writeFile(
        questionsFile,
        JSON.stringify(data, null, 2),
        "utf8"
    );
}

export async function listQuestions(subject) {
    const data = await readQuestions();

    return data[subject] || [];
}

export async function addQuestion(subject, question) {
    const data = await readQuestions();

    if (!data[subject]) {
        data[subject] = [];
    }

    const newQuestion = {
        id: Date.now().toString(),
        ...question,
    };

    data[subject].push(newQuestion);

    await writeQuestions(data);

    return newQuestion;
}

export async function removeQuestion(
    subject,
    questionId
) {
    const data = await readQuestions();

    if (!data[subject]) {
        return;
    }

    data[subject] = data[subject].filter(
        (question) =>
            String(question.id) !== String(questionId)
    );

    await writeQuestions(data);
}