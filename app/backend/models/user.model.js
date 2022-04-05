const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
var jwt = require("jsonwebtoken");
var config = require("../config");
SALT_WORK_FACTOR = 10;
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: [true, "Primeiro nome é obrigatório"],
      unique: false,
      trim: true,
      maxLength: 40,
    },
    lastName: {
      type: String,
      required: [true, "Último nome é obrigatório"],
      unique: false,
    },
    email: {
      type: String,
      required: true,
      unique: [true, "Já existe um utilizador com este email"],
      pattern: "[a-z0-9._%+!$&*=^|~#%{}-]+@([a-z0-9-]+.){1,}([a-z]{2,22})",
    },
    password: {
      type: String,
      required: [true, "Password é obrigatória"],
    },
    phoneNumber: {
      type: Number,
      unique: true,
    },
    isInternal: {
      type: Boolean,
      required: [true, "Campo referente ao tipo de utilizador é obrigatório"],
    },
    communityMemberType: {
      type: String,
      //required: [true, 'Campo de Membro da Comunidade IPS é obrigatório'],
      enum: [
        "",
        "Estudante",
        "Diplomado",
        "Docente",
        "Não Docente",
        "Bolseiro",
        "Aposentado",
      ],
    },
    county: {
      type: String,
    },
    dateOfBirth: {
      type: Date,
      required: [true, "Data de nascimento é obrigatória"],
    },
    school: {
      type: String,
    },
    service: {
      type: String,
    },
    degree: {
      type: String,
      /*enum: [
        "",
        "Licenciatura em Tecnologia e Gestão Industrial",
        "Licenciatura em Engenharia de Automação, Controlo e Instrumentação",
        "Licenciatura em Engenharia Eletrotécnica e de Computadores",
        "Licenciatura em Engenharia Informática",
        "Licenciatura em Engenharia Mecânica",
        "Licenciatura em Tecnologia Biomédica",
        "Licenciatura em Tecnologias de Energia",
        "Licenciatura em Tecnologias do Ambiente e do Mar",
      ],
      */
    },
    areasOfInterest: {
      type: [String],
      enum: [
        "Atividades Académicas",
        "Ambiental",
        "Apoio a Eventos",
        "Informática",
        "Comunicação",
        "Cultural",
        "Desporto",
        "Educação",
        "Saúde",
        "Social",
      ],
    },
    reasons: {
      type: [String],
    },
    notes: {
      type: String,
    },
    RGPD: {
      type: Boolean,
      required: [true, "Campo RGPD é obrigatório"],
    },
    role: {
      type: String,
      required: [true, "A role de utilizador é obrigatória"],
      enum: ["SUPER-ADMIN", "ADMIN", "NORMAL"],
    },
    isInactive: {
      type: Boolean,
      required: [true, "Campo se utilizador está inativo é obrigatório"],
      default: true,
    },
    imageUrl: {
      type: String,
      default: "//placehold.it/100",
    },
    xp: {
      type: Number,
      default: 0
    },
    volcoins: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", function (next) {
  let user = this;
  if (!user.isModified("password")) return next();
  bcrypt.hash(user.password, SALT_WORK_FACTOR, function (err, hash) {
    if (err) return next(err);
    user.password = hash;
    next();
  });
});

userSchema.methods.isMatchPassword = function (
  candidatePassword,
  hashPassword,
  cb
) {
  bcrypt.compare(candidatePassword, hashPassword, function (err, res) {
    if (err) return cb(err);
    cb(null, res);
  });
};

userSchema.methods.generateAuthToken = function (time) {
  let token = null;
  if (time !== "") {
    token = jwt.sign(
      {
        _id: this._id,
      },
      config.jwtPrivateKey,
      { expiresIn: time ? time : true }
    );
    return token;
  } else {
    token = jwt.sign(
      {
        _id: this._id,
      },
      config.jwtPrivateKey
    );
    return token;
  }
};

const User = mongoose.model("User", userSchema);

module.exports = User;
