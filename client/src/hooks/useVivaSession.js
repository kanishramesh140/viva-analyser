import { useCallback, useState } from "react";
import {
  finishViva,
  requestHint,
  startViva,
  submitAnswer,
} from "../api/viva.js";

export function useVivaSession() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const start = useCallback(async (payload) => {
    setLoading(true);
    setError(null);

    try {
      const result = await startViva(payload);
      setSession(result);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const answer = useCallback(async (payload) => {
    setLoading(true);
    setError(null);

    try {
      const result = await submitAnswer(payload);

      setSession((current) => ({
        ...(current || {}),
        ...result,
      }));

      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const hint = useCallback(async (payload) => {
    setLoading(true);
    setError(null);

    try {
      return await requestHint(payload);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const finish = useCallback(async (payload) => {
    setLoading(true);
    setError(null);

    try {
      const result = await finishViva(payload);
      setSession((current) => ({
        ...(current || {}),
        ...result,
        finished: true,
      }));
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setSession(null);
    setError(null);
  }, []);

  return {
    session,
    loading,
    error,
    start,
    answer,
    hint,
    finish,
    reset,
  };
}
