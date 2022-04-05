var config = require("../config");
const User = require("../models/user.model");
const path = require("path");
var passwordGenerator = require("generate-password");
const router = require("express").Router();
const axios = require("axios");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

/**
 * Return a new JSON type with {value: "val"}
 *
 * @param {Array} areas a array object
 */
const convertToJSONObj = (areas) => {
  let newArr = [];
  for (let i = 0; i < areas.length; i++) {
    const element = areas[i];
    let newElem = {
      value: element,
    };
    newArr.push(newElem);
  }
  return newArr;
};

/**
 * Get All users
 */
router.route("/").get((req, res) => {
  User.find()
    .then((users) => res.status(200).json({ success: true, users }))
    .catch((err) =>
      res.status(400).json({ success: true, message: "Error: " + err })
    );
});

/**
 * Add a new user
 */
router.route("/").post((req, res) => {
  if (req.body.email === "" || req.body.email === undefined)
    return res.status(400).json({ success: false, message: "Email vazio" });

  const newUser = new User(req.body);
  let newUserEmail = newUser.email;
  let domainCheck = newUserEmail.endsWith("ips.pt");
  let tokenReferUser = req.body.tokenReferUser;

  if (!newUser.RGPD)
    return res.status(400).json({
      success: false,
      message: "Por favor aceite o " + "tratamento de dados",
    });

  if ((!domainCheck || domainCheck === undefined) && !req.body.byAdmin) {
    return res.status(403).json({
      success: false,
      message:
        "Email não aceito." +
        " Você deve ser membro da comunidade IPS. Contacte aos administradores",
    });
  }

  var byAdminPassword = "";
  if (req.body.byAdmin) {
    byAdminPassword = passwordGenerator.generate({ length: 10, numbers: true });
    newUser.password = byAdminPassword;
  }

  User.findOne({ email: newUserEmail }, (err, user) => {
    if (user)
      if (!req.body.byAdmin)
        return res.status(400).json({
          success: false,
          message:
            "E-mail com conta associada." + "Tente recuperar palavra-passe",
        });
      else
        return res.status(400).json({
          success: false,
          message: "Já existe uma conta com esse email.",
        });
    else {
      if (!req.body.byAdmin) newUser.isInternal = true;

      if (!newUser.role) newUser.role = "NORMAL";
      newUser.save(async function (err, user) {
        if (err) {
          if (err.code == 11000 && err.keyValue.phoneNumber)
            return res.status(400).send({
              success: false,
              message: "Já exista uma conta com esse nº de telemóvel",
            });
          else
            return res.status(400).send({
              success: false,
              message: "Erro ao guardar os dados. Código do erro: " + err.code,
            });
        } else {
          let notificationBody = {
            auth: config.authKey,
            action: req.body.action,
            recipient: req.body.email,
            params: {
              firstName: newUser.firstName,
            },
          };
          if (!tokenReferUser || 0 === tokenReferUser.length) {
            if (!req.body.byAdmin)
              notificationBody.params = {
                firstName: newUser.firstName,
                url:
                  config.hostAddress +
                  "/api/credentials/confirmAccount/" +
                  newUser.generateAuthToken(""),
              };
            else
              notificationBody.params = {
                email: newUser.email,
                password: byAdminPassword,
                url:
                  config.hostAddress +
                  "/api/credentials/confirmAccount/" +
                  newUser.generateAuthToken(""),
              };
            axios.post(
              config.hostAddress + "/api/email/notify",
              notificationBody
            );
            if (!req.body.byAdmin)
              return res.status(201).json({
                success: true,
                message:
                  "Conta Criada! Verifique seu email" +
                  " e confirme sua conta. Obrigado",
              });
            else
              return res.status(201).json({
                success: true,
                message: "Conta criada com sucesso",
              });
          } else {
            let decodeToUserReferToken = jwt.verify(
              tokenReferUser,
              config.jwtPrivateKey
            );
            let filter = { _id: decodeToUserReferToken._id };
            let userToAddXP = await User.findOne(filter);
            let oldXP = userToAddXP.xp;
            userToAddXP.xp += 50;

            if (Math.trunc(oldXP / 200) < Math.trunc(userToAddXP.xp / 200))
              userToAddXP.volcoins += 10;
            userToAddXP.save();
            if (!req.body.byAdmin)
              notificationBody.params = {
                firstName: newUser.firstName,
                url:
                  config.hostAddress +
                  "/api/credentials/confirmAccount/" +
                  newUser.generateAuthToken(""),
              };
            else
              notificationBody.params = {
                email: newUser.email,
                password: byAdminPassword,
                url:
                  config.hostAddress +
                  "/api/credentials/confirmAccount/" +
                  newUser.generateAuthToken(""),
              };
            axios.post(
              config.hostAddress + "/api/email/notify",
              notificationBody
            );
            if (!req.body.byAdmin)
              return res.status(201).json({
                success: true,
                message:
                  "Conta Criada! Verifique seu email" +
                  " e confirme sua conta. Obrigado",
              });
            else
              return res.status(201).json({
                success: true,
                message: "Conta criada com sucesso",
              });
          }
        }
      });
    }
  });
});

/**
 * Set new profile image
 */
router.post("/setImage/:email", (req, res) => {
  if (req.files === null)
    return res.status(400).json({ success: false, message: "No file upload" });

  const file = req.files.file;
  const newFileName =
    req.params.email.split("@")[0] + "." + file.mimetype.split("/")[1];
  const filePath = path.join(__dirname, "../uploads/" + newFileName);

  file.mv(filePath, (err) => {
    if (err) {
      return res.status(500).json({ success: false, message: err });
    }
  });

  User.findOneAndUpdate(
    { email: req.params.email },
    { imageUrl: `/uploads/${newFileName}` },
    (err, result) => {
      if (err)
        return res.status(400).json({ success: false, message: err.message });
      else
        return res.status(200).send({
          success: true,
          imageUrl: `/uploads/${newFileName}`,
          message: "Imagem definida!",
        });
    }
  );
  //res.send({ fileName: file.name, filePath: `/uploads/${file.name}` });
});

/**
 * Get the user details by id
 */
router.route("/details/:id").get((req, res) => {
  User.findOne({ _id: req.params.id }, (err, user) => {
    if (!user)
      res
        .status(404)
        .json({ success: false, message: "Utilizador não encontrado!" });
    else return res.status(200).json({ success: true, user });
  });
});

/**
 * Delete a user by id
 */
/*
router.route("/delete/:id").delete((req, res) => {
  User.findOne({ _id: req.params.id }, (err, user) => {
    if (!user)
      return res.status(404).send({ success: false, message: "User não encontrado!" });
    else {
      User.remove({ _id: req.params.id })
        .exec()
        .then((result) => {
          let notificationBody = {
            auth: config.authKey,
            action: "accountRemoval",
            recipient: user.email,
            params: {
              firstName: user.firstName
            },
          };

          axios.post(
            config.hostAddress + "/api/email/notify",
            notificationBody
          );
          return res.status(200).json({
            success: true,
            message: "Utilizador removido!",
          });
        })
        .catch((err) => {
          return res.status(500).json({
            success: false,
            message: err,
          });
        });
    }
  });
  //return res.status(200).send({'message': 'Utilizador removido!'});
});
*/

/**
 * Update a user by id
 */
router.route("/update/:id").put(async (req, res) => {
  var newUser = new User(req.body);
  var userObject = newUser.toObject();
  delete userObject._id;
  User.findOneAndUpdate({ _id: req.params.id }, userObject, (err, result) => {
    if (!result) {
      return res
        .status(404)
        .send({ success: false, message: "Utilizador não encontrado" });
    } else if (err) {
      if (err.code == 11000 && err.keyValue.email)
        return res.status(400).send({
          success: false,
          message: "Já exista uma conta com esse email",
        });
      else if (err.code == 11000 && err.keyValue.phoneNumber)
        return res.status(400).send({
          success: false,
          message: "Já exista uma conta com esse nº de telemóvel",
        });
      else
        return res.status(400).send({ success: false, message: err.message });
    } else
      return res.status(200).json({
        success: true,
        message: "Utilizador atualizado!",
      });
  });
});

/**
 * Update password by id
 */
router.route("/updatePassword/:id").put(async (req, res) => {
  var { oldPassword, newPassword } = req.body;

  User.findOne({ _id: req.params.id }, (err, user) => {
    if (err) {
      return res.status(400).send({
        success: false,
        message: "Pedido mal efetuado!",
      });
    }
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "Utilizador não encontrado!",
      });
    }

    user.isMatchPassword(oldPassword, user.password, (err, isMatch) => {
      if (!isMatch) {
        return res.status(400).send({
          success: false,
          message: "A password inserida não corresponde à sua password atual",
        });
      }

      bcrypt.hash(newPassword, SALT_WORK_FACTOR, function (err, hash) {
        if (err) return next(err);
        user.update({ password: hash }, (err, result) => {
          if (err) {
            return res.status(400).send({
              success: false,
              message: "Pedido mal efetuado!",
            });
          }

          return res.status(200).json({
            success: true,
            message: "Password atualizada!",
          });
        });
      });
    });
  });
});

/**
 * Return the members types to react app
 */
router.route("/memberType").get((req, res) => {
  let memberType = [
    "Estudante",
    "Diplomado",
    "Docente",
    "Não Docente",
    "Bolseiro",
    "Aposentado",
  ];
  let newArr = convertToJSONObj(memberType);
  return res.status(200).json(newArr);
});

/**
 * Send emails to all email on array to recruit the selected user
 */
router.route("/recruitUsers").post(async (req, res) => {
  let data = req.body;
  let recruiterID = req.body.recruiterId;
  let currentRecruiter = await User.findOne({ _id: recruiterID });

  if (!currentRecruiter) {
    return res
      .status(404)
      .json({ success: false, message: "Utilizador não encontrado" });
  }

  if (!data.userEmails || data.userEmails.length <= 0)
    return res
      .status(400)
      .json({ success: false, message: "Não colocou nenhum email na lista!" });
  let filterNotMemberCommmunit = data.userEmails.filter(
    (el) => !el.endsWith(".ips.pt")
  );
  /* 
  if (filterNotMemberCommmunit.length > 0) {
    return res.status(400).json({
      success: false,
      message:
        "Há alguns emails que não pertence a comunidade IPS. Por favor verique-os",
    });
  } */

  data.userEmails.forEach((element) => {
    let notificationBody = {
      auth: config.authKey,
      action: "volunteeringRecruit",
      recipient: element,
      params: {
        firstNameOfRecruiter: currentRecruiter.firstName,
        lastNameOfRecruiter: currentRecruiter.lastName,
        url:
          (config.frontendHostAddress
            ? config.frontendHostAddress
            : config.hostAddress) +
          "/auth/" +
          currentRecruiter.generateAuthToken(""),
      },
    };
    axios.post(config.hostAddress + "/api/email/notify", notificationBody);
  });

  return res.status(200).json({ success: true, message: "Emails enviados" });
});

/**
 * Return the members types to react app
 */
router.route("/degree").get((req, res) => {
  let degrees = {
    "ESCOLA SUPERIOR DE TECNOLOGIA DE SETÚBAL": [
      "Licenciatura em Tecnologia e Gestão Industrial",
      "Licenciatura em Engenharia de Automação, Controlo e Instrumentação",
      "Licenciatura em Engenharia Eletrotécnica e de Computadores",
      "Licenciatura em Engenharia Informática",
      "Licenciatura em Engenharia Mecânica",
      "Licenciatura em Tecnologia Biomédica",
      "Licenciatura em Tecnologias de Energia",
      "Licenciatura em Tecnologias do Ambiente e do Mar",
    ],
    "ESCOLA SUPERIOR DE EDUCAÇÃO": [
      "Licenciatura em Animação e Intervenção Sociocultural",
      "Licenciatura em Comunicação Social",
      "Licenciatura em Desporto",
      "Licenciatura em Educação Básica",
      "Licenciatura em Tradução e Interpretação de Língua Gestual Portuguesa",
    ],
    "ESCOLA SUPERIOR DE CIÊNCIAS EMPRESARIAIS": [
      "Licenciatura em Contabilidade e Finanças",
      "Licenciatura em Contabilidade e Finanças Noturno",
      "Licenciatura em Gestão da Distribuição e da Logística",
      "Licenciatura em Gestão da Distribuição e da Logística Pós-Laboral",
      "Licenciatura em Gestão de Recursos Humanos",
      "Licenciatura em Gestão de Recursos Humanos Pós-Laboral",
      "Licenciatura em Gestão de Sistemas de Informação",
      "Licenciatura em Marketing",
    ],
    "ESCOLA SUPERIOR DE TECNOLOGIA DO BARREIRO": [
      "Licenciatura em Bioinformática",
      "Licenciatura em Biotecnologia",
      "Licenciatura em Engenharia Civil",
      "Licenciatura em Engenharia Química",
      "Licenciatura em Gestão da Construção",
      "Licenciatura em Tecnologias do Petróleo",
    ],
    "ESCOLA SUPERIOR DE SAÚDE": [
      "Licenciatura em Acupuntura",
      "Licenciatura em Enfermagem",
      "Licenciatura em Fisioterapia",
      "Licenciatura em Terapia da Fala",
    ],
  };

  //let newArr = convertToJSONObj(degrees);
  return res.status(200).json(degrees);
});

/**
 * Return the members types to react app
 */
router.route("/areasInterests").get((req, res) => {
  let areas = [
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
  ];

  let newArr = convertToJSONObj(areas);

  return res.status(200).json(newArr);
});

/**
 * Return the services of IPS
 */
router.route("/services").get((req, res) => {
  let services = [
    "CIMOB-IPS",
    "DA-IPS",
    "DFAP-IPS",
    "DI-IPS",
    "DRH-IPS",
    "GARDOC-IPS",
    "GI.COM-IPS",
    "NP-IPS",
    "SPE-IPS",
    "UAIIDE-IPS",
    "UDRVC-IPS",
    "UNIQUA-IPS",
  ];

  return res.status(200).json(convertToJSONObj(services));
});

/**
 * Return the schools of IPS
 */
router.route("/schools").get((req, res) => {
  let schools = [
    "ESCOLA SUPERIOR DE TECNOLOGIA DE SETÚBAL",
    "ESCOLA SUPERIOR DE EDUCAÇÃO",
    "ESCOLA SUPERIOR DE CIÊNCIAS EMPRESARIAIS",
    "ESCOLA SUPERIOR DE TECNOLOGIA DO BARREIRO",
    "ESCOLA SUPERIOR DE SAÚDE",
  ];

  return res.status(200).json(convertToJSONObj(schools));
});

/**
 * Return the members types to react app
 */
router.route("/reasons").get((req, res) => {
  let reasons = [
    "Pelo convívio social",
    "Porque pode ser vantajoso para o futuro profissional",
    "Pela possibilidade de integração social",
    "Para ter novas experiências",
    "Porque gosto de ajudar os outros",
    "Porque fui incentivado(a) por outras pessoas",
    "Porque conheço pessoas que já realizaram atividades de voluntariado no IPS",
    "Para me sentir útil",
    "Para ocupar tempo livre",
  ];

  let newArr = convertToJSONObj(reasons);

  return res.status(200).json(newArr);
});

/**
 * Return the members types to react app
 */
router.route("/portugalCounty").get((req, res) => {
  let county = [
    "Alenquer",
    "Amadora",
    "Arruda dos Vinhos",
    "Azambuja",
    "Cadaval",
    "Cascais",
    "Lisboa",
    "Loures",
    "Lourinhã",
    "Mafra",
    "Odivelas",
    "Oeiras",
    "Sintra",
    "Sobral de Monte Agraço",
    "Torres Vedras",
    "Vila Franca de Xira",
    "Alcácer do Sal",
    "Alcochete",
    "Almada",
    "Barreiro",
    "Grândola",
    "Moita",
    "Montijo",
    "Palmela",
    "Santiago do Cacém",
    "Seixal",
    "Sesimbra",
    "Setúbal",
  ];

  let newObj = convertToJSONObj(county);

  return res.status(200).json(newObj);
});

module.exports = router;
module.exports.convertToJSONObj = convertToJSONObj;
