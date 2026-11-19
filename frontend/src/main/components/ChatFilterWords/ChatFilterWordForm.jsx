import { Button, Form, InputGroup } from "react-bootstrap";
import { useForm } from "react-hook-form";

// Matches the VARCHAR(255) WORD column on the backend.
export const MAX_WORD_LENGTH = 255;

export default function ChatFilterWordForm({
  submitAction,
  testIdPrefix = "ChatFilterWordForm",
}) {
  // Stryker disable all
  const {
    register,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm({ defaultValues: { word: "" } });
  // Stryker restore all

  // submitAction receives a callback to clear the input, so the page can
  // clear it only after the backend accepts the word. If the backend rejects
  // it (e.g. a duplicate), the admin's text stays in the box.
  const onSubmit = (data) => submitAction(data, () => reset());

  return (
    <Form onSubmit={handleSubmit(onSubmit)} className="mb-3">
      <Form.Label htmlFor="word">Add a word or phrase to censor</Form.Label>
      <InputGroup hasValidation>
        <Form.Control
          data-testid={`${testIdPrefix}-word`}
          id="word"
          type="text"
          placeholder="e.g. badword"
          isInvalid={Boolean(errors.word)}
          {...register("word", {
            validate: (value) =>
              value.trim() !== "" || "Word must not be blank.",
            maxLength: {
              value: MAX_WORD_LENGTH,
              message: `Word must be at most ${MAX_WORD_LENGTH} characters.`,
            },
          })}
        />
        <Button type="submit" data-testid={`${testIdPrefix}-submit`}>
          Add
        </Button>
        <Form.Control.Feedback
          type="invalid"
          data-testid={`${testIdPrefix}-error`}
        >
          {errors.word?.message}
        </Form.Control.Feedback>
      </InputGroup>
    </Form>
  );
}
