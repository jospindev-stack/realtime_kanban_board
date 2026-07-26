import mongoose from 'mongoose'

const COLUMNS = ['todo', 'inprogress', 'review', 'done']
const PRIORITIES = ['low', 'medium', 'high']

const schema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true, maxlength: 200 },
  description: { type: String, default: '', maxlength: 2000 },
  column:      { type: String, enum: COLUMNS, required: true },
  order:       { type: Number, default: 0 },
  priority:    { type: String, enum: PRIORITIES, default: 'medium' },
  authorId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  authorName:  { type: String, required: true },
  authorColor: { type: String, required: true },
}, { timestamps: true })

schema.index({ column: 1, order: 1 })

export default mongoose.model('Card', schema)
