// Preset, fully-offline question banks. Any subject NOT listed here is
// handled by the AI engine (see aiEngine.js) instead of this file.

export const PRESET_SUBJECTS = {
  "Engine systems": {
    domainLabel: "Automobile",
    bank: {
      easy: [
        {
          id: "a-e1",
          q: "What is the basic function of an engine?",
          kw: ["convert", "fuel", "energy", "mechanical", "power"],
          hints: [
            "Think about what goes in (fuel) and what comes out (motion) — what transformation happens between the two?",
            "The engine changes one form of energy into another. Which two forms, specifically?",
          ],
        },
        {
          id: "a-e2",
          q: "Name the four strokes of a four-stroke engine, in order.",
          kw: ["intake", "compression", "power", "exhaust"],
          hints: [
            "There are four steps in a fixed order — start with how the air-fuel mixture enters the cylinder.",
            "After intake comes squeezing that mixture into a smaller space. What is that step called?",
          ],
        },
      ],
      moderate: [
        {
          id: "a-m1",
          q: "Why does an engine need a cooling system?",
          kw: ["heat", "overheat", "friction", "combustion", "temperature"],
          hints: [
            "Combustion and moving metal parts both generate something that has to go somewhere.",
            "If that byproduct isn't removed, what happens to the metal components over time?",
          ],
        },
        {
          id: "a-m2",
          q: "What is the role of a fuel injector?",
          kw: ["spray", "fuel", "precise", "atomize", "cylinder", "mist"],
          hints: [
            "Fuel needs to be delivered so it burns efficiently — not as a stream, but as what?",
            "What physical state does fuel need to be in, right before combustion, for it to burn cleanly?",
          ],
        },
      ],
      tough: [
        {
          id: "a-t1",
          q: "Explain why turbocharging increases engine power without increasing engine size.",
          kw: ["air", "compress", "oxygen", "exhaust", "density"],
          hints: [
            "A turbocharger reuses something that would otherwise be wasted out the tailpipe — what powers its turbine?",
            "More of what gas enters the cylinder means more fuel can be burned per stroke?",
          ],
        },
        {
          id: "a-t2",
          q: "What causes engine knocking, and why is it harmful?",
          kw: ["premature", "detonation", "ignition", "pressure", "damage"],
          hints: [
            "Knocking happens when combustion starts at the wrong moment — is it too early, or too late?",
            "If two flame fronts collide inside the cylinder instead of one smooth burn, what physical effect results?",
          ],
        },
      ],
      complex: [
        {
          id: "a-c1",
          q: "Compare the thermodynamic efficiency trade-offs between Otto and Diesel cycles.",
          kw: ["compression", "ratio", "efficiency", "ignition", "thermodynamic"],
          hints: [
            "One cycle relies on a spark, the other on heat from compression alone — how does that change the achievable compression ratio?",
            "A higher compression ratio generally trades off against which practical engineering constraint?",
          ],
        },
      ],
    },
  },
  "Human physiology": {
    domainLabel: "Healthcare",
    bank: {
      easy: [
        {
          id: "h-e1",
          q: "What is the main function of red blood cells?",
          kw: ["oxygen", "carry", "hemoglobin", "transport"],
          hints: [
            "Think about what they carry from the lungs to the rest of the body.",
            "What protein inside red blood cells actually binds to oxygen?",
          ],
        },
        {
          id: "h-e2",
          q: "Name the main organ responsible for filtering blood.",
          kw: ["kidney", "filter", "urine", "waste"],
          hints: [
            "This organ comes in a pair and produces urine as a byproduct of its job.",
            "Where does blood go to have waste removed before that waste becomes urine?",
          ],
        },
      ],
      moderate: [
        {
          id: "h-m1",
          q: "How does the heart maintain a one-way flow of blood?",
          kw: ["valve", "pressure", "chamber", "atrium", "ventricle", "backflow"],
          hints: [
            "Think about small flap-like structures between chambers — what do they prevent?",
            "What would happen without something to stop blood flowing backward when a chamber contracts?",
          ],
        },
        {
          id: "h-m2",
          q: "Explain the role of insulin in blood sugar regulation.",
          kw: ["glucose", "pancreas", "cell", "uptake", "lower"],
          hints: [
            "This hormone is released after eating — what does it let the body's cells do with sugar in the blood?",
            "Which organ releases it, and what happens to blood sugar levels afterward?",
          ],
        },
      ],
      tough: [
        {
          id: "h-t1",
          q: "Describe how the body compensates for blood loss in the short term.",
          kw: ["vasoconstriction", "heart rate", "pressure", "compensate", "baroreceptor"],
          hints: [
            "Two systems react fast — one narrows blood vessels, the other speeds something up. Which two?",
            "What sensors detect the drop in blood pressure in the first place?",
          ],
        },
        {
          id: "h-t2",
          q: "Why does the body respond to infection with a fever?",
          kw: ["immune", "pathogen", "temperature", "hypothalamus", "inhibit"],
          hints: [
            "A raised body temperature makes conditions worse for something else living in the body — what?",
            "Which part of the brain resets the body's temperature set point during illness?",
          ],
        },
      ],
      complex: [
        {
          id: "h-c1",
          q: "Explain the physiological trade-offs of the renin-angiotensin-aldosterone system in chronic hypertension.",
          kw: ["renin", "angiotensin", "aldosterone", "sodium", "vasoconstriction"],
          hints: [
            "This system evolved to correct short-term low blood pressure — what happens when it stays switched on long-term?",
            "Which hormone in this cascade both narrows vessels and triggers sodium retention?",
          ],
        },
      ],
    },
  },
};