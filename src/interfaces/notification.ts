export interface  INotification {
    id: string
    type: string
    message: string
    severitu: string
    userId: string
    createdAt: string
}

export const notificationsMock: INotification[] = [
  {
    id: "1",
    type: "INFO",
    message: "Bem-vindo de volta!",
    severitu: "LOW",
    userId: "user_123",
    createdAt: new Date().toISOString()
  },
  {
    id: "2",
    type: "ALERT",
    message: "Houve uma tentativa de login suspeita.",
    severitu: "HIGH",
    userId: "user_123",
    createdAt: new Date().toISOString()
  },
  {
    id: "3",
    type: "REMINDER",
    message: "Você possui tarefas pendentes.",
    severitu: "MEDIUM",
    userId: "user_456",
    createdAt: new Date().toISOString()
  },
  {
    id: "4",
    type: "SYSTEM",
    message: "Atualização concluída com sucesso.",
    severitu: "LOW",
    userId: "user_789",
    createdAt: new Date().toISOString()
  }
]
