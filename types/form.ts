import { z } from "zod"

export const challengeFormSchema = z.object({
  topic: z.string().min(3, {
    message: "Topic must be at least 3 characters.",
  }),
})

export type ChallengeFormValues = z.infer<typeof challengeFormSchema>