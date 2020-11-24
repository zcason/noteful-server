const NotefulService = {
    getAllNotes(knex) {
      return knex.select('*').from('notes')
    },
    getNoteById(knex, id) { 
      return knex.from('notes').select('*').where('id', id).first()
    },
    insertNote(knex, newNote) {
      return knex
        .insert(newNote)
        .into('notes')
        .returning('*')
        .then(rows => {
          return rows[0]
        })
    },
    deleteNote(knex, id) {
      return knex('notes')
        .where({ id })
        .delete()
    },
    updateNote(knex, id, newNoteFields) {
      return knex('notes')
        .where({ id })
        .update(newNoteFields)
    },
    getAllFolders(knex) {
      return knex.select('*').from('folders')
    },///////////////////////////////////////////////////////////
    getFolderById(knex, id) {
      return knex.from('folders').select('*').where('id', id).first()
    },
    insertFolder(knex, newFolder) {
      return knex
        .insert(newFolder)
        .into('folders')
        .returning('*')
        .then(rows => {
          return rows[0]
        })
    },
    deleteFolder(knex, id) {
      return knex('folders')
        .where({ id })
        .delete()
    },
    updateFolder(knex, id, newFolderFields) {
      return knex('folders')
        .where({ id })
        .update(newFolderFields)
    },
  }
  
  module.exports = NotefulService