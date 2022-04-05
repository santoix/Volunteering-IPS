const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const raffleSchema = new Schema({
  name: {
    type: String,
    required: [true, "Nome do sorteio é obrigatório"],
  },
  description: {
    type: String,
  },
  participationEndDateTime: {
    type: Date,
    required: [true, "Data de participação máxima é obrigatória"],
  },
  awardTable: {
    type: [
      {
        min: Number,
        reward: String,
        max: Number,
      },
    ],
  },
  users: {
    type: [String],
    default: [],
  },
  winners: {
    type: [
      {
        userID: String,
        placement: String,
        reward: String,
      },
    ],
  },
  wasDrawn: {
    type: Boolean,
    default: false,
  },
  isInactive: {
    type: Boolean,
    required: [true, "Campo se sorteio está inativo é obrigatório"],
    default: false,
  },
});

const Raffle = mongoose.model("Raffle", raffleSchema);

module.exports = Raffle;
