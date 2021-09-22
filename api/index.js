const express = require('express')
const app = express()
const port = 3001
const cors = require('cors')

require('dotenv').config({path: './.env'})

const {
  ensurePlayerExists,
  ensurePlayerParticipation,
  fetchMatch,
  submitAnswer,
  withdrawPlayerFromMatch
} = require('./_src/sanityApi')

const submit = require('./submit-answer')
const withDraw = require('./withdraw-player')

app.use(express.urlencoded({extended: false}))
app.use(cors())
app.use(express.json({limit: '20kb'}))

app.post('/api/sign-up-player', async (req, res) => {
  const {playerId, playerName, matchSlug} = req.body

  const player = await ensurePlayerExists(playerId, playerName)
  const match = await fetchMatch(matchSlug)
  if (!match) {
    return res.status(400).json({error: `no match for slug ${matchSlug}`})
  }

  await ensurePlayerParticipation(player, match)
  return res.status(200).json({status: 'ok'})
})

app.use('/api/submit-answer', async (req, res) => {
  const {playerId, matchSlug, questionKey, selectedChoiceKey} = req.body

  const match = await fetchMatch(matchSlug)
  if (!match) {
    return res.status(400).json({error: `no match for slug ${matchSlug}`})
  }

  await submitAnswer(match, playerId, questionKey, selectedChoiceKey)
  return res.status(200).json({status: 'ok'})
})

app.use('/api/withdraw-player', async (req, res) => {
  const {playerId, matchSlug} = req.body

  const match = await fetchMatch(matchSlug)
  if (!match) {
    return res.status(400).json({error: `no match for slug ${matchSlug}`})
  }

  await withdrawPlayerFromMatch(playerId, match)
  return res.status(200).json({status: 'ok'})
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
