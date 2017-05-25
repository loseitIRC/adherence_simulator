var chart = c3.generate({
    size: {
      // width: 960,
      height: 500
    },
    data: {
        x: 'x',
        columns: ['x', 0, 365]
    },
    axis: {
      x: {
        label: 'Day #',
        tick: { count: 9 }
      },
      y: {
        label: 'Weight (kg)'
      }
    },
    transition: {
      duration: 1000
    }
});


function getInputFloatValue(selector) {
  return parseFloat(document.querySelector(selector).value);
}

function getInputIntValue(selector) {
  return parseInt(document.querySelector(selector).value);
}

function waterAndPoo() {
  var WATER_AND_POO_FLUCTUATION = getInputFloatValue("#water_poo_sigma");
  return WATER_AND_POO_FLUCTUATION * (2*Math.random() - 1);
}

NORMALDIST = d3.random.normal();
function weightSimulation() {
  var STARTWEIGHT_KG = getInputFloatValue("#startweight"),
      AGE = getInputIntValue("#age"),
      HEIGHT_CM = getInputFloatValue("#height"),
      INTAKE = getInputFloatValue("#baseintake"),
      INTAKE_OVERAGE = getInputFloatValue("#intake_overage"), // Defines overeating range
      INTAKE_UNDERAGE = getInputFloatValue("#intake_underage"), // Defines undereating range
      ADHERENCE_FRACTION = getInputFloatValue("#adherence_frac"), // Fraction of the time dietary plan is adhered to
      NUMDAYS = getInputIntValue("#numdays");

  current_TDEE = BMR(HEIGHT_CM, STARTWEIGHT_KG, AGE, "M")*1.2;
  d = [{
    'days': 0,
    'idealweight': STARTWEIGHT_KG,
    'trueweight': STARTWEIGHT_KG
  }];
  for(i=1; i<NUMDAYS; i++) {
    current_TDEE = BMR(HEIGHT_CM, d[d.length-1].idealweight, 27, "M")*1.2;
    // The distribution here is...very lazy. I should think about this more
    if (Math.random() < ADHERENCE_FRACTION) {
      excess = INTAKE - current_TDEE - Math.abs(d3.random.normal(INTAKE_UNDERAGE, INTAKE_UNDERAGE*0.25)());
    } else {
      excess = current_TDEE + Math.abs(d3.random.normal(INTAKE_OVERAGE, INTAKE_OVERAGE*0.25)());;
    }
    d.push({'days': i,
            'trueweight': d[d.length-1].idealweight + excess/3500/7 + waterAndPoo(),
            'idealweight': d[d.length-1].idealweight + excess/3500/7
  				});
  }

  return d;
}

function updateChart(chart, d) {
  chart.load({
  columns: [
    ['x'].concat(d.map(
      (p)=>p.days)
    ),
    ['Daily weight'].concat(d.map(
      (p)=>p.trueweight)
    ),
    ['Ideal trend (no water/poo)'].concat(d.map(
      (p)=>p.idealweight)
    )
  ]
  });
}

var haveplotted = false;

//** Calculate basal metabolic rate using Mifflin St Jeor */
function BMR(height_in_cm, weight_in_kg, age, gender) {
  if (gender == "M") {
    s = 5;
  } else if (gender == "F") {
    s = -161;
  } else {
    throw 'Gender must be "M" or "F"';
  }

  bmr = 10*weight_in_kg + 6.25*height_in_cm - 5.0*age + s;
  return bmr;
}

function inches_to_cm(inches) {
  return inches * 2.54;
}

function lbs_to_kg(lbs) {
  return lbs / 2.2046;
}

function simulateAndUpdate() {
  d = weightSimulation();
  updateChart(chart, d);
}

document.querySelector("#recalcbtn").onclick = simulateAndUpdate;
window.onload = simulateAndUpdate;
