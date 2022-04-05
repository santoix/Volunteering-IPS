require("dotenv").config();
const chai = require("chai");
const mongoose = require("mongoose");
const chaiHttp = require("chai-http");
const config = require("../config");
const data = require("./dataGamification.json");
const dataProject = require("./dataProject.json");
const dataUser = require("./dataUser.json");
const User = require("../models/user.model");
const uri = config.atlasUri;
const assert = require("assert");

chai.use(chaiHttp);
chai.should();

before(function (done) {
  mongoose.connect(uri, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  });

  const connection = mongoose.connection;
  connection.once("open", async () => {
    userJoanam = await User.findOne({ _id: data.USER_JOANAM._id });
    userMarco = await User.findOne({ _id: data.USER_MARCO._id });
    await User.deleteOne({ email: dataUser.USER_ADD_VALID_USER.email });
    done();
  });
});

describe("Gamificação", async () => {
  it("RF18 - Deve receber XP e receber pontos por nível", async () => {
    userJoanam.xp = 200;
    userJoanam.volcoins = 10;
    let level = userJoanam.xp / 200;
    assert.equal(level, 1);
  });

  it("RF19 - Deve poder ver nível XP e volcoins", async () => {
    assert.equal(userJoanam.xp, 200);
    assert.equal(userJoanam.volcoins, 10);
    userJoanam.xp = 0;
    userJoanam.volcoins = 0;
    userJoanam.save();
  });

  it("RF22 - Deve receber XP ao fazer proposta e esta ser aceita", async () => {
    before(async () => {
      chai
        .request("http://localhost:5000")
        .get("/api/user/details/" + data.USER_JOANAM._id)
        .end((err, res) => {
          chai.assert.isNull(err);
          res.body.should.be.a("object");
          res.should.have.status(200);
          res.body.should.have.property("success").equal(true);
          res.body.should.have.property("user").property("xp").equal(150);
        });
    });
    chai
      .request("http://localhost:5000")
      .post("/api/project/propositionStatus/")
      .send(dataProject.ACCPTED_PROJECT)
      .end((err, res) => {
        chai.assert.isNull(err);
        chai.assert.isNotEmpty(res.body);
        res.body.should.have.property("success").equal(true);
        res.body.should.have.property("message").equal("Projeto Aceito!");
      });
  });

  it("RF20 - Deve poder consultar nível nível de outro utilizador", async () => {
    let marcoXp = userMarco.xp;
    assert.equal(marcoXp, 450);
  });

  it("RF21 - Deve receber XP ao participar em projeto/atividade", async () => {
    before(async () => {
      chai
        .request("http://localhost:5000")
        .get("/api/user/details/" + data.USER_JOANAM._id)
        .end((err, res) => {
          chai.assert.isNull(err);
          res.body.should.be.a("object");
          res.should.have.status(200);
          res.body.should.have.property("success").equal(true);
          res.body.should.have.property("user").property("xp").equal(250);
        });
    });
    chai
      .request("http://localhost:5000")
      .put(
        "/api/project/update/" +
          dataProject.UPDATE_PROJECT._id +
          "/projectMembers/confirmPresence"
      )
      .send(dataProject.ACCEPT_USERS)
      .end((err, res) => {
        chai.assert.isNull(err);
        chai.assert.isNotEmpty(res.body);
        res.should.have.status(200);
        res.body.should.have.property("success").equal(true);
      });
  });

  it("RF23 - Deve receber XP caso uma pessoa aceite a proposta de recrutamento", async () => {
    before(async () => {
      chai
        .request("http://localhost:5000")
        .get("/api/user/details/" + data.USER_JOANAM._id)
        .end((err, res) => {
          chai.assert.isNull(err);
          res.body.should.be.a("object");
          res.should.have.status(200);
          res.body.should.have.property("success").equal(true);
          res.body.should.have.property("user").property("xp").equal(200);
        });
    });
    chai
      .request("http://localhost:5000")
      .post("/api/user")
      .send(dataUser.ADD_BY_REFER_USER)
      .end(async (err, res) => {
        chai.assert.isNull(err);
        chai.assert.isNotEmpty(res.body);
        res.should.have.status(201);
        res.body.should.have.property("success").equal(true);
      });
  });

  it("RF24 - Deve permitir gastar pontos em sorteios", async () => {
    setTimeout(() => {
      chai
        .request("http://localhost:5000")
        .post("/api/raffle/participate")
        .send(data.SPEND_COINS)
        .end(async (err, res) => {
          chai.assert.isNull(err);
          chai.assert.isNotEmpty(res.body);
          res.should.have.status(200);
          res.body.should.have.property("success").equal(true);
        });
    }, 500);

    setTimeout(() => {
      chai
        .request("http://localhost:5000")
        .get("/api/user/details/" + data.USER_JOANAM._id)
        .end((err, res) => {
          chai.assert.isNull(err);
          res.body.should.be.a("object");
          res.should.have.status(200);
          res.body.should.have.property("success").equal(true);
          res.body.should.have.property("user").property("volcoins").equal(9);
        });
    }, 600);
  });

  it("Deve fazer um sorteio", async () => {
    chai
      .request("http://localhost:5000")
      .get("/api/raffle/drawWinners/" + data.SORTEIO_CANETA._id)
      .end((err, res) => {
        chai.assert.isNull(err);
        res.body.should.be.a("object");
        res.should.have.status(200);
        res.body.should.have.property("success").equal(true);
      });
  });
});
