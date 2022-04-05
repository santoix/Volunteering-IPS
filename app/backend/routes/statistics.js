const Project = require("../models/project.model");
const User = require("../models/user.model");
const path = require("path");
const router = require("express").Router();
const jwt = require("jsonwebtoken");
const config = require("../config");
const axios = require("axios");
const moment = require("moment");
moment.locale("pt");

router.route("/project/:id/ages").get((req, res) => {
  Project.findOne({ _id: req.params.id }, (err, project) => {
    if (!project)
      res
        .status(404)
        .json({ success: false, message: "Projeto não encontrado!" });

    User.find()
      .where("_id")
      .in(
        project.users
          .filter((user) => user.isAccepted)
          .map((user) => user.userID)
      )
      .exec((err, users) => {
        var data = [["Idade", "Quantidade"]];
        users.forEach((user) => {
          var ageDifMs = Date.now() - user.dateOfBirth.getTime();
          var ageDate = new Date(ageDifMs);
          var age = Math.abs(ageDate.getUTCFullYear() - 1970);
          var found = false;
          for (var i = 0; i < data.length; i++) {
            // This if statement depends on the format of your array
            if (data[i][0] === age.toString() + " anos") {
              data[i][1]++;
              found = true;
              break; // Found it
            }
          }

          if (!found) data.push([age.toString() + " anos", 1]);
        });
        return res.status(200).send({
          success: true,
          statisticsData: data,
        });
      });
  });
});

router.route("/project/:id/usersAreasOfInterest").get((req, res) => {
  Project.findOne({ _id: req.params.id }, (err, project) => {
    if (!project)
      res
        .status(404)
        .json({ success: false, message: "Projeto não encontrado!" });

    User.find()
      .where("_id")
      .in(
        project.users
          .filter((user) => user.isAccepted)
          .map((user) => user.userID)
      )
      .exec((err, users) => {
        var data = [["Área de Interesse", "Quantidade"]];
        users.forEach((user) => {
          user.areasOfInterest.forEach((area) => {
            var found = false;
            for (var i = 0; i < data.length; i++) {
              // This if statement depends on the format of your array
              if (data[i][0] === area) {
                data[i][1]++;
                found = true;
                break; // Found it
              }
            }

            if (!found) data.push([area, 1]);
          });
        });
        return res.status(200).send({
          success: true,
          statisticsData: data,
        });
      });
  });
});

router.route("/project/:id/usersCountys").get((req, res) => {
  Project.findOne({ _id: req.params.id }, (err, project) => {
    if (!project)
      res
        .status(404)
        .json({ success: false, message: "Projeto não encontrado!" });

    User.find()
      .where("_id")
      .in(
        project.users
          .filter((user) => user.isAccepted)
          .map((user) => user.userID)
      )
      .exec((err, users) => {
        var data = [["Concelho", "Quantidade"]];
        users.forEach((user) => {
          var found = false;
          for (var i = 0; i < data.length; i++) {
            // This if statement depends on the format of your array
            if (data[i][0] === user.county) {
              data[i][1]++;
              found = true;
              break; // Found it
            }
          }

          if (!found) data.push([user.county, 1]);
        });
        return res.status(200).send({
          success: true,
          statisticsData: data,
        });
      });
  });
});

router.route("/project/:id/usersSchools").get((req, res) => {
  Project.findOne({ _id: req.params.id }, (err, project) => {
    if (!project)
      res
        .status(404)
        .json({ success: false, message: "Projeto não encontrado!" });

    User.find()
      .where("_id")
      .in(
        project.users
          .filter((user) => user.isAccepted)
          .map((user) => user.userID)
      )
      .exec((err, users) => {
        var data = [["Escola", "Quantidade"]];
        users.forEach((user) => {
          if (user.school !== "") {
            var found = false;
            for (var i = 0; i < data.length; i++) {
              // This if statement depends on the format of your array
              if (data[i][0] === user.school) {
                data[i][1]++;
                found = true;
                break; // Found it
              }
            }

            if (!found) data.push([user.school, 1]);
          }
        });
        return res.status(200).send({
          success: true,
          statisticsData: data,
        });
      });
  });
});

router.route("/project/:id/usersDegrees").get((req, res) => {
  Project.findOne({ _id: req.params.id }, (err, project) => {
    if (!project)
      res
        .status(404)
        .json({ success: false, message: "Projeto não encontrado!" });

    User.find()
      .where("_id")
      .in(
        project.users
          .filter((user) => user.isAccepted)
          .map((user) => user.userID)
      )
      .exec((err, users) => {
        var data = [["Curso", "Quantidade"]];
        users.forEach((user) => {
          if (user.degree !== "") {
            var found = false;
            for (var i = 0; i < data.length; i++) {
              // This if statement depends on the format of your array
              if (data[i][0] === user.degree) {
                data[i][1]++;
                found = true;
                break; // Found it
              }
            }

            if (!found) data.push([user.degree, 1]);
          }
        });
        return res.status(200).send({
          success: true,
          statisticsData: data,
        });
      });
  });
});

router.route("/project/:id/usersCommunityMemberTypes").get((req, res) => {
  Project.findOne({ _id: req.params.id }, (err, project) => {
    if (!project)
      res
        .status(404)
        .json({ success: false, message: "Projeto não encontrado!" });

    User.find()
      .where("_id")
      .in(
        project.users
          .filter((user) => user.isAccepted)
          .map((user) => user.userID)
      )
      .exec((err, users) => {
        var data = [["Tipo de Membro da Comunidade", "Quantidade"]];
        users.forEach((user) => {
          if (user.communityMemberType !== "") {
            var found = false;
            for (var i = 0; i < data.length; i++) {
              // This if statement depends on the format of your array
              if (data[i][0] === user.communityMemberType) {
                data[i][1]++;
                found = true;
                break; // Found it
              }
            }

            if (!found) data.push([user.communityMemberType, 1]);
          }
        });
        return res.status(200).send({
          success: true,
          statisticsData: data,
        });
      });
  });
});

router.route("/projects/types").get((req, res) => {
  Project.find()
    .then((projects) => {
      var data = [["Tipo", "Quantidade"]];
      projects
        .filter((project) => project.isAccepted)
        .forEach((project) => {
          var type = project.isInternal ? "Interno" : "Externo";
          var found = false;
          for (var i = 0; i < data.length; i++) {
            // This if statement depends on the format of your array
            if (data[i][0] === type) {
              data[i][1]++;
              found = true;
              break; // Found it
            }
          }

          if (!found) data.push([type, 1]);
        });
      res.status(200).json({ success: true, statisticsData: data });
    })
    .catch((err) =>
      res.status(400).json({ success: false, message: "Error: " + err })
    );
});

router.route("/projects/projectsAreasOfInterest").get((req, res) => {
  Project.find()
    .then((projects) => {
      var data = [["Área de Interesse", "Quantidade"]];
      projects
        .filter((project) => project.isAccepted)
        .forEach((project) => {
          project.areasOfInterest.forEach((area) => {
            var found = false;
            for (var i = 0; i < data.length; i++) {
              // This if statement depends on the format of your array
              if (data[i][0] === area) {
                data[i][1]++;
                found = true;
                break; // Found it
              }
            }

            if (!found) data.push([area, 1]);
          });
        });
      res.status(200).json({ success: true, statisticsData: data });
    })
    .catch((err) =>
      res.status(400).json({ success: false, message: "Error: " + err })
    );
});

router.route("/projects/projectsPerMonth").get((req, res) => {
  Project.find()
    .then((projects) => {
      var data = [["Mês", "Internos", "Externos"]];
      projects
        .filter((project) => project.isAccepted)
        .forEach((project) => {
          var found = false;
          var date =
            project.foreseenStartDateTime.getUTCMonth() +
            1 +
            "/" +
            project.foreseenStartDateTime.getUTCFullYear();
          for (var i = 0; i < data.length; i++) {
            // This if statement depends on the format of your array
            if (data[i][0] === date) {
              if (project.isInternal) data[i][1]++;
              else data[i][2]++;
              found = true;
              break; // Found it
            }
          }

          if (!found)
            if (project.isInternal) data.push([date, 1, 0]);
            else data.push([date, 0, 1]);
        });
      res.status(200).json({ success: true, statisticsData: data });
    })
    .catch((err) =>
      res.status(400).json({ success: false, message: "Error: " + err })
    );
});

router.route("/projects/volunteersPerMonth").get((req, res) => {
  Project.find()
    .then((projects) => {
      var data = [["Mês", "Voluntariados Internos", "Voluntariados Externos"]];
      projects
        .filter((project) => project.isAccepted)
        .forEach((project) => {
          var found = false;
          var date =
            project.foreseenStartDateTime.getUTCMonth() +
            1 +
            "/" +
            project.foreseenStartDateTime.getUTCFullYear();
          var numberOfVolunteers = project.users.filter(
            (user) => user.isAccepted
          ).length;
          for (var i = 0; i < data.length; i++) {
            // This if statement depends on the format of your array
            if (data[i][0] === date) {
              if (project.isInternal) data[i][1] += numberOfVolunteers;
              else data[i][2] += numberOfVolunteers;
              found = true;
              break; // Found it
            }
          }

          if (!found)
            if (project.isInternal) data.push([date, numberOfVolunteers, 0]);
            else data.push([date, 0, numberOfVolunteers]);
        });
      res.status(200).json({ success: true, statisticsData: data });
    })
    .catch((err) =>
      res.status(400).json({ success: false, message: "Error: " + err })
    );
});

router.route("/projects/attendancePerMonth").get((req, res) => {
  Project.find()
    .then((projects) => {
      var data = [["Mês", "Participantes", "Não Participantes"]];
      projects
        .filter((project) => project.isAccepted)
        .forEach((project) => {
          var found = false;
          var date =
            project.foreseenStartDateTime.getUTCMonth() +
            1 +
            "/" +
            project.foreseenStartDateTime.getUTCFullYear();
          var numberOfAttendies = project.users.filter(
            (user) => user.isAccepted && user.didAttend
          ).length;
          var numberOfNonAttendies = project.users.filter(
            (user) => user.isAccepted && user.didAttend === false
          ).length;
          for (var i = 0; i < data.length; i++) {
            // This if statement depends on the format of your array
            if (data[i][0] === date) {
              data[i][1] += numberOfAttendies;
              data[i][2] += numberOfNonAttendies;
              found = true;
              break; // Found it
            }
          }

          if (!found)
            data.push([date, numberOfAttendies, numberOfNonAttendies]);
        });
      res.status(200).json({ success: true, statisticsData: data });
    })
    .catch((err) =>
      res.status(400).json({ success: false, message: "Error: " + err })
    );
});

router.route("/projects/usersPerTypePerYear").get(async (req, res) => {
  try {
    var data = [
      [
        "Ano",
        "Estudante",
        "Diplomado",
        "Docente",
        "Não Docente",
        "Bolseiro",
        "Aposentado",
      ],
    ];
    var projects = await Project.find({ isAccepted: true });
    for (const project of projects) {
      var found = false;
      var date = project.foreseenStartDateTime.getUTCFullYear().toString();
      for (var i = 0; i < data.length; i++) {
        // This if statement depends on the format of your array
        if (data[i][0] === date) {
          found = true;
          break; // Found it
        }
      }

      if (!found) data.push([date, 0, 0, 0, 0, 0, 0]);

      var users = await User.find({
        _id: { $in: project.users.map((x) => x.userID) },
      });
      for (const user of users) {
        for (var i = 0; i < data.length; i++) {
          // This if statement depends on the format of your array
          if (data[i][0] === date) {
            switch (user.communityMemberType) {
              case "Estudante":
                data[i][1]++;
                break;
              case "Diplomado":
                data[i][2]++;
                break;
              case "Docente":
                data[i][3]++;
                break;
              case "Não Docente":
                data[i][4]++;
                break;
              case "Bolseiro":
                data[i][5]++;
                break;
              case "Aposentado":
                data[i][6]++;
                break;
              default:
                break;
            }
            break; // Found it
          }
        }
      }
    }
    res.status(200).json({ success: true, statisticsData: data });
  } catch (err) {
    res.status(400).json({ success: false, message: "Error: " + err });
  }
});

router.route("/projects/usersPerCountyPerYear").get(async (req, res) => {
  try {
    var projects = await Project.find({ isAccepted: true });
    var data = [["Concelho"]];
    var years = [
      ...new Set(
        projects.map((x) => x.foreseenStartDateTime.getUTCFullYear().toString())
      ),
    ];
    data[0].push(...years);
    for (const project of projects) {
      var date = project.foreseenStartDateTime.getUTCFullYear().toString();

      var users = await User.find({
        _id: { $in: project.users.map((x) => x.userID) },
      });
      for (const user of users) {
        var found = false;
        var county = user.county;
        for (var i = 0; i < data.length; i++) {
          // This if statement depends on the format of your array
          if (data[i][0] === county) {
            data[i][years.indexOf(date) + 1]++;
            found = true;
            break; // Found it
          }
        }

        if (!found) data.push([county, ...years.map((x) => 0)]);
      }
    }
    res.status(200).json({ success: true, statisticsData: data });
  } catch (err) {
    res.status(400).json({ success: false, message: "Error: " + err });
  }
});

router.route("/projects/usersPerSchoolPerYear").get(async (req, res) => {
  try {
    var data = [
      [
        "Ano",
        "ESCOLA SUPERIOR DE TECNOLOGIA DE SETÚBAL",
        "ESCOLA SUPERIOR DE EDUCAÇÃO",
        "ESCOLA SUPERIOR DE CIÊNCIAS EMPRESARIAIS",
        "ESCOLA SUPERIOR DE TECNOLOGIA DO BARREIRO",
        "ESCOLA SUPERIOR DE SAÚDE",
      ],
    ];
    var projects = await Project.find({ isAccepted: true });
    for (const project of projects) {
      var found = false;
      var date = project.foreseenStartDateTime.getUTCFullYear().toString();
      for (var i = 0; i < data.length; i++) {
        // This if statement depends on the format of your array
        if (data[i][0] === date) {
          found = true;
          break; // Found it
        }
      }

      if (!found) data.push([date, 0, 0, 0, 0, 0]);

      var users = await User.find({
        _id: { $in: project.users.map((x) => x.userID) },
      });
      for (const user of users) {
        for (var i = 0; i < data.length; i++) {
          // This if statement depends on the format of your array
          if (data[i][0] === date) {
            switch (user.school) {
              case "ESCOLA SUPERIOR DE TECNOLOGIA DE SETÚBAL":
                data[i][1]++;
                break;
              case "ESCOLA SUPERIOR DE EDUCAÇÃO":
                data[i][2]++;
                break;
              case "ESCOLA SUPERIOR DE CIÊNCIAS EMPRESARIAIS":
                data[i][3]++;
                break;
              case "ESCOLA SUPERIOR DE TECNOLOGIA DO BARREIRO":
                data[i][4]++;
                break;
              case "ESCOLA SUPERIOR DE SAÚDE":
                data[i][5]++;
                break;
              default:
                break;
            }
            break; // Found it
          }
        }
      }
    }
    res.status(200).json({ success: true, statisticsData: data });
  } catch (err) {
    res.status(400).json({ success: false, message: "Error: " + err });
  }
});

router.route("/users/averageAge").get(async (req, res) => {
  try {
    var users = await User.find();
    users = users.filter((user) => !user.isInactive);

    var sumOfAges = 0;
    for (const user of users) {
      var ageDifMs = Date.now() - user.dateOfBirth.getTime();
      var ageDate = new Date(ageDifMs);
      sumOfAges += Math.abs(ageDate.getUTCFullYear() - 1970);
    }

    res
      .status(200)
      .json({ success: true, statisticsData: sumOfAges / users.length });
  } catch (err) {
    res.status(400).json({ success: false, message: "Error: " + err });
  }
});

router.route("/users/numberOfUsers").get(async (req, res) => {
  try {
    var users = await User.find();

    res.status(200).json({ success: true, statisticsData: users.length });
  } catch (err) {
    res.status(400).json({ success: false, message: "Error: " + err });
  }
});

router.route("/users/topSchool").get(async (req, res) => {
  try {
    var users = await User.find();

    var schoolsCount = {
      "ESCOLA SUPERIOR DE TECNOLOGIA DE SETÚBAL": 0,
      "ESCOLA SUPERIOR DE EDUCAÇÃO": 0,
      "ESCOLA SUPERIOR DE CIÊNCIAS EMPRESARIAIS": 0,
      "ESCOLA SUPERIOR DE TECNOLOGIA DO BARREIRO": 0,
      "ESCOLA SUPERIOR DE SAÚDE": 0,
    };

    var projects = await Project.find({ isAccepted: true });
    for (const project of projects) {
      var users = await User.find({
        _id: { $in: project.users.map((x) => x.userID) },
      });
      users = users.filter((x) => x.school);
      for (const user of users) schoolsCount[user.school]++;
    }

    res
      .status(200)
      .json({
        success: true,
        statisticsData: Object.keys(schoolsCount).reduce((a, b) =>
          schoolsCount[a] > schoolsCount[b] ? a : b
        ),
      });
  } catch (err) {
    res.status(400).json({ success: false, message: "Error: " + err });
  }
});

router.route("/projects/topAreaOfInterest").get(async (req, res) => {
  try {
    var users = await User.find();

    var areasOfInterestCount = {
      "Atividades Académicas": 0,
      Ambiental: 0,
      "Apoio a Eventos": 0,
      Informática: 0,
      Comunicação: 0,
      Cultural: 0,
      Desporto: 0,
      Educação: 0,
      Saúde: 0,
      Social: 0,
    };

    var projects = await Project.find({ isAccepted: true });
    for (const project of projects)
      project.areasOfInterest.forEach((area) => areasOfInterestCount[area]++);

    res
      .status(200)
      .json({
        success: true,
        statisticsData: Object.keys(areasOfInterestCount).reduce((a, b) =>
          areasOfInterestCount[a] > areasOfInterestCount[b] ? a : b
        ),
      });
  } catch (err) {
    res.status(400).json({ success: false, message: "Error: " + err });
  }
});

router.route("/users/topCounty").get(async (req, res) => {
  try {
    var users = await User.find();
    users = users.filter((x) => !x.isInactive);

    var countysCount = {
      Alenquer: 0,
      Amadora: 0,
      "Arruda dos Vinhos": 0,
      Azambuja: 0,
      Cadaval: 0,
      Cascais: 0,
      Lisboa: 0,
      Loures: 0,
      Lourinhã: 0,
      Mafra: 0,
      Odivelas: 0,
      Oeiras: 0,
      Sintra: 0,
      "Sobral de Monte Agraço": 0,
      "Torres Vedras": 0,
      "Vila Franca de Xira": 0,
      "Alcácer do Sal": 0,
      Alcochete: 0,
      Almada: 0,
      Barreiro: 0,
      Grândola: 0,
      Moita: 0,
      Montijo: 0,
      Palmela: 0,
      "Santiago do Cacém": 0,
      Seixal: 0,
      Sesimbra: 0,
      Setúbal: 0,
    };

    for (const user of users) countysCount[user.county]++;

    res
      .status(200)
      .json({
        success: true,
        statisticsData: Object.keys(countysCount).reduce((a, b) =>
          countysCount[a] > countysCount[b] ? a : b
        ),
      });
  } catch (err) {
    res.status(400).json({ success: false, message: "Error: " + err });
  }
});

router
  .route("/projects/numberOfSpecificTrainingProjects")
  .get(async (req, res) => {
    try {
      var projects = await Project.find();
      projects = projects.filter(
        (x) => x.specificTraining !== "" && x.isAccepted
      );

      res.status(200).json({ success: true, statisticsData: projects.length });
    } catch (err) {
      res.status(400).json({ success: false, message: "Error: " + err });
    }
  });

router.route("/user/:id/numberOfParticipations").get(async (req, res) => {
  try {
    var projects = await Project.find({ isAccepted: true });

    var count = 0;
    for (const project of projects) {
      var auxUser = project.users.filter((x) => x.userID === req.params.id)[0];
      if (auxUser && auxUser.isAccepted) count++;
    }
    res.status(200).json({ success: true, statisticsData: count });
  } catch (err) {
    res.status(400).json({ success: false, message: "Error: " + err });
  }
});

router.route("/user/:id/numberOfApplications").get(async (req, res) => {
  try {
    var projects = await Project.find({ isAccepted: true });

    var count = 0;
    for (const project of projects) {
      var auxUser = project.users.filter((x) => x.userID === req.params.id)[0];
      if (auxUser) count++;
    }
    res.status(200).json({ success: true, statisticsData: count });
  } catch (err) {
    res.status(400).json({ success: false, message: "Error: " + err });
  }
});

router.route("/user/:id/numberOfPropositions").get(async (req, res) => {
  try {
    var projects = await Project.find({ createdBy: req.params.id });

    res.status(200).json({ success: true, statisticsData: projects.length });
  } catch (err) {
    res.status(400).json({ success: false, message: "Error: " + err });
  }
});

module.exports = router;
