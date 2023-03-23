const express = require("express");
const mongoose = require("mongoose");

const app = express();
mongoose.connect("mongodb://localhost:27017/throttleDB", { useNewUrlParser: true });

const throttleSchema = new mongoose.Schema({
    name: String,
    apiCount: Number,
    time: String
});
const Throttle = mongoose.model("Throttle", throttleSchema);
const throttle = new Throttle({
    name: "Test",
    apiCount: 0,
    time: ""
})
//Maximum 2 requests allowed in 5 Seconds.
let maxAllowedTime = 5000;
let maxAllowedRequest = 2;

app.get("/", async function(req, res)  {

    let dbResult=await Throttle.find({});
         if (dbResult[0].time == "") {
                let currentTime=new Date().toISOString().slice(17,19)+"000";
                await Throttle.updateOne({ name: "Test" }, { time: currentTime});
            }
    setTimeout(()=> {
        console.log("Delayed for 1 second.");
    },  "1000"    
    );
    let endTime = new Date().toISOString().slice(17,19)+"000";

    let dbExecResult=await Throttle.find({});
             if (dbExecResult[0].apiCount > maxAllowedRequest && endTime - dbExecResult[0].time > maxAllowedTime) {
                await Throttle.updateOne({ name: "Test" }, { apiCount: 0 });
                await Throttle.updateOne({ name: "Test" }, { time: '' });
                console.log("Max Request Limit has Reached");
            }
            else {
                let latestCount = dbExecResult[0].apiCount+1;
                await Throttle.updateOne({ name: "Test" }, { apiCount: latestCount });
            }
}
);
app.listen(process.env.PORT || 7000, () => {
    console.log('Express server started on port');
}
);

