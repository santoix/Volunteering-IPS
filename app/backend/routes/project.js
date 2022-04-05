const Project = require("../models/project.model");
const User = require("../models/user.model");
const path = require("path");
const router = require("express").Router();
const jwt = require("jsonwebtoken");
const config = require("../config");
const axios = require("axios");
const moment = require("moment");
moment.locale("pt");

/*
router.use(function (req, res, next) {
  let date = new Date();
  let buildedTime =
    date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
  let buildedDate =
    date.getDay() + "-" + date.getMonth() + "-" + date.getFullYear();
  console.log("/api/project Request at: " + buildedDate + " " + buildedTime);
  next();
});
*/

/**
 * Get All projects
 */
router.route("/").get((req, res) => {
  Project.find()
    .then((projects) => res.status(200).json({ success: true, projects }))
    .catch((err) =>
      res.status(400).json({ success: false, message: "Error: " + err })
    );
});

/**
 * Get the project details by id
 */
router.route("/details/:id").get((req, res) => {
  Project.findOne({ _id: req.params.id }, (err, project) => {
    if (!project)
      res
        .status(404)
        .json({ success: false, message: "Projeto não encontrado!" });
    else return res.status(200).json({ success: true, project });
  });
});

/**
 * Add project
 */
router.route("/").post((req, res) => {
  const newProject = new Project(req.body);
  if (!newProject.RGPD)
    return res.status(400).json({
      success: false,
      message: "Por favor aceite o " + "tratamento de dados",
    });

  newProject.save(function (err, project) {
    if (err) {
      if (err.name == "ValidationError")
        return res.status(400).send({
          success: false,
          message: "Erro ao guardar os dados. " + err.message,
        });
      else
        return res.status(400).send({
          success: false,
          message: "Erro ao guardar os dados. Código do erro: " + err.code,
        });
    }

    return res.status(201).json({
      projectID: project._id,
      success: true,
      message: "Projeto criado com sucesso",
    });
  });
});

/**
 * Add proposal (They are equal in terms of logic, however it's been split so it won't be necessary to change anything in code on the frontend)
 */
router.route("/proposal").post((req, res) => {
  const newProject = new Project(req.body);

  if (!newProject.RGPD)
    return res.status(400).json({
      success: false,
      message: "Por favor aceite o " + "tratamento de dados",
    });

  newProject.save(function (err, project) {
    if (err) {
      if (err.name == "ValidationError")
        return res.status(400).send({
          success: false,
          message: "Erro ao guardar os dados. " + err.message,
        });
      else
        return res.status(400).send({
          success: false,
          message: "Erro ao guardar os dados. Código do erro: " + err.code,
        });
    }
    User.findOne({ _id: newProject.users[0].userID }, (err, user) => {
      if (user) {
        User.find({ role: { $ne: "NORMAL" } }).exec((err, users) => {
          users.forEach((x) => {
            let data = {
              auth: config.authKey,
              action: "volunteeringProposal",
              recipient: x.email,
              params: {
                firstName: x.firstName,
                volunteeringName: newProject.name,
                userName: user.firstName + " " + user.lastName,
                areasOfInterest: newProject.areasOfInterest.join(", "),
                startDate: moment(newProject.foreseenStartDateTime).format(
                  "LLL"
                ),
                endDate: moment(newProject.foreseenEndDateTime).format("LLL"),
              },
            };
            axios.post(config.hostAddress + "/api/email/notify", data);
          });
        });
      }
    });

    return res.status(201).json({
      projectID: project._id,
      success: true,
      message: "Proposta submetida com sucesso",
    });
  });
});

/**
 * Add user to project users
 */
router.route("/:id/users").post(async (req, res) => {
  const user = req.body;
  Project.findOne({ _id: req.params.id }, (err, project) => {
    if (!project)
      return res
        .status(404)
        .send({ success: false, message: "Projeto não encontrado!" });

    if (project.users.filter((x) => x.userID === user.userID).length > 0)
      return res
        .status(400)
        .send({ success: false, message: "Já se encontra no projeto!" });

    if (project.users.filter((x) => x.userID === user.userID).length > 0)
      return res
        .status(400)
        .send({ success: false, message: "Já se encontra no projeto!" });

    var customUser = {};
    customUser.userID = user.userID;
    customUser.isPersonOfContact = false;

    project.users.push(customUser);
    project.save();
    return res
      .status(200)
      .send({ success: true, message: "A sua candidatura foi submetida!" });
  });
});

/**
 * Get the Users of the Project
 */
router.route("/:id/users").get((req, res) => {
  User.find()
    .then((users) => {
      Project.findOne({ _id: req.params.id }, (err, project) => {
        if (!project)
          return res
            .status(404)
            .json({ success: false, message: "Projeto não encontrado!" });
        else {
          const projectUsers = Object.values(project.users).map(
            (user) => user["userID"]
          );
          var projectUsersDetails = [];
          users.forEach((user) => {
            if (projectUsers.includes(user._id.toString()))
              projectUsersDetails.push(user);
          });
          return res.status(200).send({ success: true, projectUsersDetails });
        }
      });
    })
    .catch((err) =>
      res.status(400).json({ success: false, message: "Error: " + err })
    );
});

/**
 * Remove Users from the Project
 */
router.route("/update/:id/projectMembers/remove").put((req, res) => {
  const usersToRemove = req.body.usersToRemove;
  const reason = req.body.reason;
  Project.findOne({ _id: req.params.id }, (err, project) => {
    if (!project)
      return res
        .status(404)
        .json({ success: false, message: "Projeto não encontrado!" });
    else {
      var projectUsers = Object.values(project.users);
      var newProjectUsers = projectUsers.filter(function (e) {
        return this.indexOf(e.userID) < 0;
      }, usersToRemove);

      Project.findOneAndUpdate(
        { _id: req.params.id },
        { users: newProjectUsers },
        (err, result) => {
          if (!result) {
            return res
              .status(404)
              .send({ success: false, message: "Projeto não encontrado" });
          } else if (err)
            return res
              .status(400)
              .send({ success: false, message: err.message });
          else {
            User.find()
              .where("_id")
              .in(usersToRemove)
              .exec((err, users) => {
                users.forEach((user) => {
                  let data = {
                    auth: config.authKey,
                    action: "volunteeringRemovedUser",
                    recipient: user.email,
                    params: {
                      firstName: user.firstName,
                      volunteeringName: project.name,
                      reason: reason,
                    },
                  };
                  axios.post(config.hostAddress + "/api/email/notify", data);
                });
              });
            return res.status(200).send({
              success: true,
              message: "Utilizador(es) removido(s) com sucesso do projeto",
            });
          }
        }
      );
    }
  });
});

/**
 * Update project members presence status to confirmed
 */
router.route("/update/:id/projectMembers/confirmPresence").put(async (req, res) => {
  const usersToConfirm = req.body.usersToConfirm;
  var project = await Project.findOne({ _id: req.params.id })
  if (!project)
    return res
      .status(404)
      .json({ success: false, message: "Projeto não encontrado!" });
  else {
    var projectUsers = Object.values(project.users);

    for (const user of projectUsers) {
      if (usersToConfirm.includes(user.userID)) {
        if (!user.didAttend) {
          let userToAddXP = await User.findOne({ _id: user.userID });
          var oldXP = userToAddXP.xp;
          userToAddXP.xp += 150;
          if (Math.trunc(oldXP / 200) < Math.trunc(userToAddXP.xp / 200))
            userToAddXP.volcoins += 10;
          userToAddXP.save();
        }
        user.didAttend = true;
      }
    }

    Project.findOneAndUpdate(
      { _id: req.params.id },
      { users: projectUsers },
      (err, result) => {
        if (!result) {
          return res
            .status(404)
            .send({ success: false, message: "Projeto não encontrado" });
        } else if (err)
          return res
            .status(400)
            .send({ success: false, message: err.message });
        else
          return res.status(200).send({
            success: true,
            message: "A presença dos membros foi confirmada!",
          });
      }
    );
  }
});

/**
 * Update project members presence status to revoked (false)
 */
router.route("/update/:id/projectMembers/revokePresence").put((req, res) => {
  const usersToConfirm = req.body.usersToConfirm;
  Project.findOne({ _id: req.params.id }, (err, project) => {
    if (!project)
      return res
        .status(404)
        .json({ success: false, message: "Projeto não encontrado!" });
    else {
      var projectUsers = Object.values(project.users);
      projectUsers.forEach((user) => {
        if (usersToConfirm.includes(user.userID)) user.didAttend = false;
      });

      Project.findOneAndUpdate(
        { _id: req.params.id },
        { users: projectUsers },
        (err, result) => {
          if (!result) {
            return res
              .status(404)
              .send({ success: false, message: "Projeto não encontrado" });
          } else if (err)
            return res
              .status(400)
              .send({ success: false, message: err.message });
          else
            return res.status(200).send({
              success: true,
              message: "A presença dos membros foi confirmada!",
            });
        }
      );
    }
  });
});

/**
 * Update project members to person of contact as true
 */
router.route("/update/:id/projectMembers/makePOC").put((req, res) => {
  const usersToConfirm = req.body.usersToConfirm;
  Project.findOne({ _id: req.params.id }, (err, project) => {
    if (!project)
      return res
        .status(404)
        .json({ success: false, message: "Projeto não encontrado!" });
    else {
      var projectUsers = Object.values(project.users);
      projectUsers.forEach((user) => {
        if (usersToConfirm.includes(user.userID)) user.isPersonOfContact = true;
      });

      Project.findOneAndUpdate(
        { _id: req.params.id },
        { users: projectUsers },
        (err, result) => {
          if (!result) {
            return res
              .status(404)
              .send({ success: false, message: "Projeto não encontrado" });
          } else if (err)
            return res
              .status(400)
              .send({ success: false, message: err.message });
          else
            return res.status(200).send({
              success: true,
              message: "Membros foram tornados Pessoas de Contacto com sucesso",
            });
        }
      );
    }
  });
});

/**
 * Update project members to person of contact as false
 */
router.route("/update/:id/projectMembers/revokePOC").put((req, res) => {
  const usersToConfirm = req.body.usersToConfirm;
  Project.findOne({ _id: req.params.id }, (err, project) => {
    if (!project)
      return res
        .status(404)
        .json({ success: false, message: "Projeto não encontrado!" });
    else {
      var projectUsers = Object.values(project.users);
      projectUsers.forEach((user) => {
        if (usersToConfirm.includes(user.userID))
          user.isPersonOfContact = false;
      });

      Project.findOneAndUpdate(
        { _id: req.params.id },
        { users: projectUsers },
        (err, result) => {
          if (!result) {
            return res
              .status(404)
              .send({ success: false, message: "Projeto não encontrado" });
          } else if (err)
            return res
              .status(400)
              .send({ success: false, message: err.message });
          else
            return res.status(200).send({
              success: true,
              message:
                "Membros foram revogados de Pessoas de Contacto com sucesso",
            });
        }
      );
    }
  });
});

/**
 * Update project members to accepted
 */
router.route("/update/:id/projectMembers/accept").put((req, res) => {
  const usersToConfirm = req.body.usersToConfirm;
  const reason = req.body.reason;
  Project.findOne({ _id: req.params.id }, async (err, project) => {
    if (!project)
      return res
        .status(404)
        .json({ success: false, message: "Projeto não encontrado!" });
    else {
      var projectUsers = Object.values(project.users);
      projectUsers.forEach((user) => {
        if (usersToConfirm.includes(user.userID)) user.isAccepted = true;
      });

      Project.findOneAndUpdate(
        { _id: req.params.id },
        { users: projectUsers },
        (err, result) => {
          if (!result) {
            return res
              .status(404)
              .send({ success: false, message: "Projeto não encontrado" });
          } else if (err)
            return res
              .status(400)
              .send({ success: false, message: err.message });
          else {
            User.find()
              .where("_id")
              .in(usersToConfirm)
              .exec((err, users) => {
                users.forEach((user) => {
                  let data = {
                    auth: config.authKey,
                    action: "volunteeringApplicationStatus",
                    recipient: user.email,
                    params: {
                      firstName: user.firstName,
                      volunteeringName: project.name,
                      proposalState: "Aceite",
                      reason: reason,
                    },
                  };
                  axios.post(config.hostAddress + "/api/email/notify", data);
                });
              });
            return res.status(200).send({
              success: true,
              message: "Membros foram aceites com sucesso",
            });
          }
        }
      );
    }
  });
});

/**
 * Update project members to declined
 */
router.route("/update/:id/projectMembers/decline").put((req, res) => {
  const usersToConfirm = req.body.usersToConfirm;
  const reason = req.body.reason;
  Project.findOne({ _id: req.params.id }, (err, project) => {
    if (!project)
      return res
        .status(404)
        .json({ success: false, message: "Projeto não encontrado!" });
    else {
      var projectUsers = Object.values(project.users);
      projectUsers.forEach((user) => {
        if (usersToConfirm.includes(user.userID)) user.isAccepted = false;
      });

      Project.findOneAndUpdate(
        { _id: req.params.id },
        { users: projectUsers },
        (err, result) => {
          if (!result) {
            return res
              .status(404)
              .send({ success: false, message: "Projeto não encontrado" });
          } else if (err)
            return res
              .status(400)
              .send({ success: false, message: err.message });
          else {
            User.find()
              .where("_id")
              .in(usersToConfirm)
              .exec((err, users) => {
                users.forEach((user) => {
                  let data = {
                    auth: config.authKey,
                    action: "volunteeringApplicationStatus",
                    recipient: user.email,
                    params: {
                      firstName: user.firstName,
                      volunteeringName: project.name,
                      proposalState: "Recusada",
                      reason: reason,
                    },
                  };
                  axios.post(config.hostAddress + "/api/email/notify", data);
                });
              });
            return res.status(200).send({
              success: true,
              message: "Membros foram recusados com sucesso",
            });
          }
        }
      );
    }
  });
});

/**
 * Set logo for project
 */
router.route("/setLogo/:id").put((req, res) => {
  if (req.files === null)
    return res.status(400).json({ success: false, message: "No file upload" });

  const file = req.files.file;
  const newFileName = req.params.id + "." + file.mimetype.split("/")[1];
  const filePath = path.join(__dirname, "../uploads/" + newFileName);

  file.mv(filePath, (err) => {
    if (err) {
      return res.status(500).json({ success: false, message: err });
    }
  });

  Project.findOneAndUpdate(
    { _id: req.params.id },
    { logo: `/uploads/${newFileName}` },
    (err, result) => {
      if (err)
        return res.status(400).json({ success: false, message: err.message });
      else
        return res.status(200).send({
          success: true,
          logo: `/uploads/${newFileName}`,
          message: "Logo definida!",
        });
    }
  );
  //res.send({ fileName: file.name, filePath: `/uploads/${file.name}` });
});

/**
 * Update a project by id
 */
router.route("/update/:id").put(async (req, res) => {
  var newProject = new Project(req.body);
  var oldProject = await axios.get(
    config.hostAddress + "/api/project/details/" + req.params.id
  );
  var projectObject = newProject.toObject();

  delete projectObject._id;
  Project.findOneAndUpdate(
    { _id: req.params.id },
    projectObject,
    async (err, result) => {
      if (!result) {
        return res
          .status(404)
          .send({ success: false, message: "Projeto não encontrado" });
      } else if (err)
        return res.status(400).send({ success: false, message: err.message });
      else {
        if (oldProject.data.project.isInactive !== projectObject.isInactive) {
          const users = await axios.get(
            config.hostAddress + "/api/project/" + req.params.id + "/users"
          );
          users.data.projectUsersDetails.forEach((user) => {
            let data = {
              auth: config.authKey,
              action: "volunteeringStatus",
              recipient: user.email,
              params: {
                firstName: user.firstName,
                volunteeringName: oldProject.data.project.name,
                status: projectObject.isInactive ? "Desativado" : "Ativado",
              },
            };
            axios.post(config.hostAddress + "/api/email/notify", data);
          });
        }

        return res.status(200).json({
          success: true,
          message: "Projeto atualizado!",
        });
      }
    }
  );
});

/**
 * Response when accept or decline a proposition to user
 */
router.route("/propositionStatus/").post(async (req, res) => {
  let userID = req.body.users[0].userID;
  let user = await User.findOne({ _id: userID });
  let project = await Project.findOne({ _id: req.body._id });

  if (!user) {
    return res
      .status(404)
      .json({ success: false, message: "Utilizador não encontrado" });
  }
  if (!project) {
    return res
      .status(404)
      .json({ success: false, message: "Projeto não encontrado" });
  } else {
    let data = {
      auth: config.authKey,
      action: "volunteeringProposalStatus",
      recipient: user.email,
      params: {
        firstName: user.firstName,
        reason: req.body.reason,
        proposal: req.body.name,
        proposalState: req.body.proposalState,
      },
    };
    if (req.body.proposalState === "Aceito") {
      project.isAccepted = true;
      await project.save();

      /* Add XP */
      var oldXP = user.xp;
      user.xp += 150;
      if (Math.trunc(oldXP / 200) < Math.trunc(user.xp / 200))
        user.volcoins += 10;
      user.save();

      //axios.post(config.hostAddress + "/api/email/notify", data);
      return res
        .status(200)
        .json({ success: true, message: "Projeto Aceito!" });
    } else {
      project.isAccepted = false;
      await project.save();
      axios.post(config.hostAddress + "/api/email/notify", data);
      return res
        .status(200)
        .json({ success: true, message: "Projeto Recusado!" });
    }
  }
});

/**
 * Check if User is a Person of Contact of the Project or Admin
 */
router.route("/isPersonOfContactOrAdmin/:id").get((req, res) => {
  try {
    const token = req.cookies.token;
    let decoded = jwt.verify(token, config.jwtPrivateKey);
    User.findOne({ _id: decoded._id }, (err, user) => {
      if (err)
        return res.status(400).send({ success: false, message: err.message });
      else {
        Project.findOne({ _id: req.params.id }, (err, project) => {
          if (err)
            return res
              .status(400)
              .send({ success: false, message: err.message });
          else {
            var allowed = false;
            project.users.forEach((element) => {
              if (
                element.userID.toString() === user._id.toString() &&
                element.isPersonOfContact
              )
                allowed = true;
            });
            if (!allowed && user.role === "NORMAL")
              return res.status(401).send({
                success: false,
                message: "Não tem acesso a esta página",
              });
            else
              return res
                .status(200)
                .send({ success: true, message: "Access allowed" });
          }
        });
      }
    });
  } catch (err) {
    return res.status(400).send({
      success: false,
      message: err.message,
    });
  }
});

/**
 * Set logo for project
 */
router.route("/setLogo/:id").put((req, res) => {
  if (req.files === null)
    return res.status(400).json({ success: false, message: "No file upload" });

  const file = req.files.file;
  const newFileName = req.params.id + "." + file.mimetype.split("/")[1];
  const filePath = path.join(__dirname, "../uploads/" + newFileName);

  file.mv(filePath, (err) => {
    if (err) {
      return res.status(500).json({ success: false, message: err });
    }
  });

  Project.findOneAndUpdate(
    { _id: req.params.id },
    { logo: `/uploads/${newFileName}` },
    (err, result) => {
      if (err)
        return res.status(400).json({ success: false, message: err.message });
      else
        return res.status(200).send({
          success: true,
          logo: `/uploads/${newFileName}`,
          message: "Logo definida!",
        });
    }
  );
  //res.send({ fileName: file.name, filePath: `/uploads/${file.name}` });
});

/**
 * Get ALL project propostions
 */
router.route("/propositions").get((req, res) => {
  Project.find({ isAccepted: null })
    .then((propositions) =>
      res.status(200).json({ success: true, propositions })
    )
    .catch((err) =>
      res.status(400).json({ success: false, messange: "Error: " + err })
    );
});

module.exports = router;
