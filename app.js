const express = require("express");
const path = require("path");
const app = express();
app.use(express.json());

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const dbPath = path.join(__dirname, "covid19India.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    stateId: dbObject.state_id,
    stateName: dbObject.state_name,
    population: dbObject.population,
  };
};

app.get("/states/", async (request, response) => {
  const getPlayersQuery = `
    SELECT
      *
    FROM
      state;`;
  const playersArray = await db.all(getPlayersQuery);
  response.send(
    playersArray.map((eachPlayer) =>
      convertDbObjectToResponseObject(eachPlayer)
    )
  );
});

//get stateId

app.get("/states/:stateId/", async (request, response) => {
  const { stateId } = request.params;
  const getState = `SELECT * FROM state WHERE state_id=${stateId};`;
  const dbResponse = await db.get(getState);
  response.send(convertDbObjectToResponseObject(dbResponse));
});

//post
app.post("/districts/", async (request, response) => {
  const post = request.body;
  const { districtName, stateId, cases, cured, active, deaths } = post;
  const addBookQuery = `INSERT INTO district (district_name,state_id,
        cases,cured,active,deaths)
        VALUES 
        ('${districtName}',${stateId},${cases},${cured},${active},
        ${deaths});
        `;
  const dbResponse = await db.run(addBookQuery);
  const bookId = dbResponse.lastID;
  response.send("District Successfully Added");
});

//get district

app.get("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const getDistrict = `SELECT * FROM district
     WHERE district_id=${districtId};`;

  const dbResponse = await db.get(getDistrict);
  response.send(dbResponse);
});

//delete

app.delete("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const delete_row = `DELETE FROM district
     WHERE district_id=${districtId};`;
  await db.run(delete_row);
  response.send("District Removed");
});

//update

app.put("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const update = request.body;
  const { districtName, stateId, cases, cured, active, deaths } = update;
  const updateDetails = `UPDATE district 
    SET 
    district_name='${districtName}',
    state_id=${stateId},
    cases=${cases},
    cured=${cured},
    active=${active},
    deaths=${deaths}
    WHERE district_id=${districtId};`;
  await db.run(updateDetails);

  response.send("District Details Updated");
});

// get  /districts/:districtId/details/

// app.get("/districts/:districtId/details/",(request,response)=>{
//     const {districtId}=request.params;
//     const
// })
