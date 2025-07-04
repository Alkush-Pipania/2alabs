import z from "zod";

export const formSchema = z.object({
    message: z.string().min(1, { message: "Message cannot be empty" }),
})
type FormValues = z.infer<typeof formSchema>;
export type { FormValues }

