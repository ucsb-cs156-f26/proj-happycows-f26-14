import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import ChatFilterWordForm, {
  MAX_WORD_LENGTH,
} from "main/components/ChatFilterWords/ChatFilterWordForm";

describe("ChatFilterWordForm tests", () => {
  const testId = "ChatFilterWordForm";

  test("MAX_WORD_LENGTH matches the backend column size", () => {
    expect(MAX_WORD_LENGTH).toBe(255);
  });

  test("renders the label, input, and Add button", () => {
    render(<ChatFilterWordForm submitAction={vi.fn()} />);

    expect(
      screen.getByLabelText("Add a word or phrase to censor"),
    ).toBeInTheDocument();
    expect(screen.getByTestId(`${testId}-word`)).toHaveAttribute(
      "placeholder",
      "e.g. badword",
    );
    expect(screen.getByTestId(`${testId}-submit`)).toHaveTextContent("Add");
  });

  test("uses a custom testIdPrefix when one is passed", () => {
    render(<ChatFilterWordForm submitAction={vi.fn()} testIdPrefix="Other" />);
    expect(screen.getByTestId("Other-word")).toBeInTheDocument();
    expect(screen.getByTestId("Other-submit")).toBeInTheDocument();
  });

  test("submits the word and clears the input when the clear callback runs", async () => {
    const submitAction = vi.fn((_data, clearInput) => clearInput());
    render(<ChatFilterWordForm submitAction={submitAction} />);

    const input = screen.getByTestId(`${testId}-word`);
    fireEvent.change(input, { target: { value: "darn" } });
    fireEvent.click(screen.getByTestId(`${testId}-submit`));

    await waitFor(() => expect(submitAction).toHaveBeenCalledTimes(1));
    expect(submitAction.mock.calls[0][0]).toEqual({ word: "darn" });
    await waitFor(() => expect(input).toHaveValue(""));
  });

  test("keeps the input when the clear callback is not run", async () => {
    const submitAction = vi.fn();
    render(<ChatFilterWordForm submitAction={submitAction} />);

    const input = screen.getByTestId(`${testId}-word`);
    fireEvent.change(input, { target: { value: "darn" } });
    fireEvent.click(screen.getByTestId(`${testId}-submit`));

    await waitFor(() => expect(submitAction).toHaveBeenCalledTimes(1));
    expect(input).toHaveValue("darn");
  });

  test("shows an error and does not submit a blank word", async () => {
    const submitAction = vi.fn();
    render(<ChatFilterWordForm submitAction={submitAction} />);

    fireEvent.change(screen.getByTestId(`${testId}-word`), {
      target: { value: "   " },
    });
    fireEvent.click(screen.getByTestId(`${testId}-submit`));

    expect(
      await screen.findByText("Word must not be blank."),
    ).toBeInTheDocument();
    expect(screen.getByTestId(`${testId}-word`)).toHaveClass("is-invalid");
    expect(screen.getByTestId(`${testId}-error`)).toHaveTextContent(
      "Word must not be blank.",
    );
    expect(submitAction).not.toHaveBeenCalled();
  });

  test("accepts a word of exactly the max length", async () => {
    const submitAction = vi.fn();
    render(<ChatFilterWordForm submitAction={submitAction} />);

    fireEvent.change(screen.getByTestId(`${testId}-word`), {
      target: { value: "a".repeat(255) },
    });
    fireEvent.click(screen.getByTestId(`${testId}-submit`));

    await waitFor(() => expect(submitAction).toHaveBeenCalledTimes(1));
    expect(screen.getByTestId(`${testId}-word`)).not.toHaveClass("is-invalid");
  });

  test("shows an error and does not submit a word over the max length", async () => {
    const submitAction = vi.fn();
    render(<ChatFilterWordForm submitAction={submitAction} />);

    fireEvent.change(screen.getByTestId(`${testId}-word`), {
      target: { value: "a".repeat(256) },
    });
    fireEvent.click(screen.getByTestId(`${testId}-submit`));

    expect(
      await screen.findByText("Word must be at most 255 characters."),
    ).toBeInTheDocument();
    expect(submitAction).not.toHaveBeenCalled();
  });
});
