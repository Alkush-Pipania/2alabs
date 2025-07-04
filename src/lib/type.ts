export type InputBoxProps = {
  id: string
  onSendMessage: (message: string) => Promise<void>
  greeting?: string
  hasMessages: boolean
}