export type ServerActionState<TData = undefined> = {
  ok: boolean;
  message: string;
  data?: TData;
  fieldErrors?: Record<string, string[]>;
  submittedAt?: number;
};

export const initialServerActionState: ServerActionState = {
  ok: false,
  message: "",
};
