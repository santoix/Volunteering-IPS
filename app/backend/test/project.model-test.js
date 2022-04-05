const mongoose = require("mongoose");
var config = require("../config");
SALT_WORK_FACTOR = 10;
const Schema = mongoose.Schema;

const projectSchema = new Schema(
  {
    isInternal: {
      type: Boolean,
      required: [true, "Campo referente ao tipo de projeto é obrigatório"],
    },
    isAccepted: {
      type: Boolean,
    },
    name: {
      type: String,
      required: [true, "Nome do projeto é obrigatório"],
      //unique: [true, "Já existe um projeto com esse nome"]
    },
    organizationName: {
      type: String,
      required: false,
    },
    users: {
      type: [
        {
          userID: String,
          isAccepted: Boolean,
          didAttend: Boolean,
          isPersonOfContact: Boolean,
        },
      ],
    },
    summary: {
      type: String,
      required: [true, "Sumário do projeto é obrigatório"],
    },
    areaOfIntervention: {
      type: String,
      required: [true, "Área de Intervenção obrigatória"],
    },
    targetAudience: {
      type: [String],
      required: [true, "Público Alvo é obrigatório"],
    },
    objectives: {
      type: [String],
    },
    activitiesDescription: {
      type: String,
      requied: [true, "Descrição das Atividades é obrigatório"],
    },
    specificTraining: {
      type: String,
    },
    foreseenStartDateTime: {
      type: Date,
      required: [true, "Data/Hora prevista é obrigatória"],
    },
    foreseenEndDateTime: {
      type: Date,
      required: [true, "Data/Hora prevista é obrigatória"],
    },
    areasOfInterest: {
      type: [String],
    },
    envolvedEntities: {
      type: [String],
    },
    logo: {
      type: String,
      default: "//placehold.it/100",
    },
    notes: {
      type: String,
    },
    vacancies: {
      type: Number,
      required: [true, "Nº de vagas é obrigatório"],
    },
    RGPD: {
      type: Boolean,
      required: [true, "Campo RGPD é obrigatório"],
    },
    locationCoord: {
      type: String,
      required: [true, "A localização é obrigatória"],
      default: "38.5218273,-8.8386823", //Coordenates of IPS
    },
    isInactive: {
      type: Boolean,
      required: [true, "Campo se projeto está inativo é obrigatório"],
      default: true,
    },
    createdBy: {
      type: String,
      //required: [true, "Campo de 'criado por' é obrigatório"]
    },
  },
  {
    timestamps: true,
  }
);

const Project = mongoose.model("ProjectTest", projectSchema);

module.exports = Project;
