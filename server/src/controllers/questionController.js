import {
  addQuestion,
  listQuestions,
  removeQuestion,
} from "../repositories/questionRepository.js";

export async function list(req, res, next) {
  try {
    const questions = await listQuestions(req.params.subject);

    res.json({
      ok: true,
      questions,
    });
  } catch (error) {
    next(error);
  }
}

export async function create(req, res, next) {
  try {
    const question = await addQuestion(
      req.params.subject,
      req.body
    );

    res.status(201).json({
      ok: true,
      question,
    });
  } catch (error) {
    next(error);
  }
}

export async function remove(req, res, next) {
  try {
    await removeQuestion(
      req.params.subject,
      req.params.questionId
    );

    res.json({
      ok: true,
    });
  } catch (error) {
    next(error);
  }
}
