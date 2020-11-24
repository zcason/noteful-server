const express = require('express')
const xss = require('xss')
const { v4: uuidv4 } = require('uuid')
const logger = require('../logger')
const NotefulService = require('./noteful-service')

const notefulRouter = express.Router()
const bodyParser = express.json()

const serializeNote = note => ({
  id: note.id,
  name: xss(note.name),
  modified: note.modified,
  content: xss(note.content),
  folderId: note.folderid,
})
const serializeFolder = folder => ({
  id: folder.id,
  name: xss(folder.name),
})

notefulRouter
  .route('/notes')
  .get((req, res, next) => {
    NotefulService.getAllNotes(req.app.get('db'))
      .then(notes => {
        res.json(notes.map(serializeNote))
      })
      .catch(next)
  })
  .post(bodyParser, (req, res, next) => {
    for (const field of ['name', 'modified', 'folderId', 'content']) {
      if (!req.body[field]) {
        logger.error(`${field} is required`)
        return res.status(400).send(`'${field}' is required`)
      }
    }

    const { name, modified, folderId, content } = req.body

    const newNote = { name, modified, folderId, content }

    NotefulService.insertNote(
      req.app.get('db'),
      newNote
    )
      .then(note => {
        logger.info(`Note with id ${note.id} created.`)
        res
          .status(201)
          .location(`/notes/${note.id}`)
          .json(serializeNote(note))
      })
      .catch(next)
  })

notefulRouter
  .route('/notes/:id')
  .all((req, res, next) => {
    const { id } = req.params
    NotefulService.getNoteById(req.app.get('db'), id)
      .then(note => {
        if (!note) {
          logger.error(`Note with id ${id} not found.`)
          return res.status(404).json({
            error: { message: `Note Not Found` }
          })
        }
        res.note = note
        next()
      })
      .catch(next)

  })
  .get((req, res) => {
    res.json(serializeNote(res.note))
  })
  .delete((req, res, next) => {
    const { id } = req.params
    NotefulService.deleteNote(
      req.app.get('db'),
      id
    )
      .then(numRowsAffected => {
        logger.info(`Note with id ${id} deleted.`)
        res.status(204).end()
      })
      .catch(next)
  })

notefulRouter
  .route('/folders')
  .get((req, res, next) => {
    NotefulService.getAllFolders(req.app.get('db'))
      .then(folders => {
        res.json(folders.map(serializeFolder))
      })
      .catch(next)
  })
  .post(bodyParser, (req, res, next) => {
    for (const field of ['name']) {
      if (!req.body[field]) {
        logger.error(`${field} is required`)
        return res.status(400).send(`'${field}' is required`)
      }
    }

    const { name } = req.body

    const newFolder = { name }

    NotefulService.insertFolder(
      req.app.get('db'),
      newFolder
    )
      .then(folder => {
        logger.info(`Folder with id ${folder.id} created.`)
        res
          .status(201)
          .location(`/folders/${folder.id}`)
          .json(serializeFolder(folder))
      })
      .catch(next)
  })

notefulRouter
  .route('/folders/:id')
  .all((req, res, next) => {
    const { id } = req.params
    NotefulService.getFolderById(req.app.get('db'), id)
      .then(folder => {
        if (!folder) {
          logger.error(`Folder with id ${id} not found.`)
          return res.status(404).json({
            error: { message: `Folder Not Found` }
          })
        }
        res.folder = folder
        next()
      })
      .catch(next)

  })
  .get((req, res) => {
    res.json(serializeFolder(res.folder))
  })
  .delete((req, res, next) => {
    const { id } = req.params
    NotefulService.deleteFolder(
      req.app.get('db'),
      id
    )
      .then(numRowsAffected => {
        logger.info(`Folder with id ${id} deleted.`)
        res.status(204).end()
      })
      .catch(next)
  })

module.exports = notefulRouter
