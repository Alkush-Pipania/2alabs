"use client"

import { ArrowRight, Loader2 } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import TextareaAutosize from "react-textarea-autosize"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form"
import { formSchema, FormValues } from "@/lib/schema"
import { InputBoxProps } from "@/lib/type"
import Image from "next/image"




export default function InputBox({ onSendMessage, hasMessages }: InputBoxProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { message: "" },
  })


  useEffect(() => {
    const timer = setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus()
      }
    }, 100) 

    return () => clearTimeout(timer)
  }, [])


  const onSubmit = async (values: FormValues) => {
    if (!values.message.trim() || isSubmitting) return

    try {
      setIsSubmitting(true)
      await onSendMessage(values.message)
      form.reset()
    } catch (error) {
      console.error("Error submitting message:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const containerPositionClass = hasMessages
    ? "fixed bottom-0 left-0 right-0 pb-4 z-50"
    : "fixed inset-0 flex items-center justify-center pointer-events-none z-50"

  return (
    <div className={containerPositionClass}>
      <div
        className={`w-full max-w-[700px] mx-auto px-4 gap-y-6 pointer-events-auto ${hasMessages ? "" : "flex flex-col items-center"}`}
      >
        {!hasMessages && (
          <Image src={"/2alabs.png"} alt="2alabs" width={150} height={150} />
        )}
        <div className="w-full">
          <div
            className="border min-h-[120px] border-[#343636] dark:border-[#343636] bg-white dark:bg-[#202222] rounded-xl p-3 shadow-md hover:shadow-lg focus-within:border-blue-300 dark:focus-within:border-[#343636] transition-all w-full ring-1 ring-slate-100 dark:ring-transparent"
          >
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="relative">
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <TextareaAutosize
                            {...field}
                            ref={textareaRef}
                            autoFocus
                            disabled={isSubmitting}
                            minRows={1}
                            maxRows={6}
                            placeholder={"Ask anything or @ any commands"}
                            className={`w-full bg-transparent resize-none text-base py-2 px-1 outline-none border-none disabled:opacity-50 transition-colors ${
                              "text-slate-800 dark:text-gray-200 placeholder:text-slate-500 dark:placeholder:text-gray-400"
                            }`}
                            onKeyDown={(event: any) => {
                              if (event.key === "Enter" && !event.shiftKey && !isSubmitting) {
                                event.preventDefault()
                                form.handleSubmit(onSubmit)()
                              }
                            }}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <div className="flex items-center justify-between mt-1">
                    <div></div>
                    <div className="flex items-center">
                      <button
                        type="submit"
                        className="h-8 w-8 text-white cursor-pointer rounded-md transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md hover:scale-105 bg-[#2E9AA5]"
                        disabled={!form.formState.isValid || isSubmitting}
                      >
                        {isSubmitting ? (
                          <Loader2 className="w-4 h-4 text-white animate-spin" />
                        ) : (
                          <ArrowRight className="w-4 h-4 text-white" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  )
}