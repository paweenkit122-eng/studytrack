import { createApp } from './app'
import { env } from './env'

const app = createApp()

app.listen(env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`🚀 StudyTrack API listening on http://localhost:${env.PORT}`)
})
