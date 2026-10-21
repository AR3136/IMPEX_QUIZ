import { Question, ClientQuestion, AnswerOption, QuizAttemptInfo } from './types.js';

/**
 * MASTER QUESTION BANK (100 QUESTIONS)
 * Source: Manufacturing_Cogsdill_100_MCQ.xlsx
 *
 * 100 questions across 10 balanced sections (10 questions per quiz, 1 from each section):
 * - 5 General Manufacturing sections (50 questions)
 * - 5 Cogsdill & ZX Tooling sections (50 questions)
 *
 * NOTE: This file is strictly kept on the server/serverless layer.
 * It is never bundled into public client application code.
 */
export const MASTER_QUESTION_BANK: Question[] = [
  {
    "id": 1,
    "section": "Manufacturing Fundamentals",
    "question": "What is the main purpose of manufacturing?",
    "options": {
      "A": "To convert raw materials into useful products",
      "B": "To store raw materials only",
      "C": "To transport finished goods only"
    },
    "correctAnswer": "A"
  },
  {
    "id": 2,
    "section": "Manufacturing Fundamentals",
    "question": "Which of the following is a subtractive manufacturing process?",
    "options": {
      "A": "Injection moulding",
      "B": "Machining",
      "C": "3D printing"
    },
    "correctAnswer": "B"
  },
  {
    "id": 3,
    "section": "Manufacturing Fundamentals",
    "question": "What does CNC stand for?",
    "options": {
      "A": "Computer Numerical Control",
      "B": "Central Network Communication",
      "C": "Controlled Number Calculation"
    },
    "correctAnswer": "A"
  },
  {
    "id": 4,
    "section": "Manufacturing Fundamentals",
    "question": "Which machine is commonly used to produce cylindrical components by rotating the workpiece?",
    "options": {
      "A": "Milling machine",
      "B": "Drilling machine",
      "C": "Lathe machine"
    },
    "correctAnswer": "C"
  },
  {
    "id": 5,
    "section": "Manufacturing Fundamentals",
    "question": "Which process is commonly used to produce flat surfaces and slots?",
    "options": {
      "A": "Milling",
      "B": "Casting",
      "C": "Forging"
    },
    "correctAnswer": "A"
  },
  {
    "id": 6,
    "section": "Manufacturing Fundamentals",
    "question": "What is the purpose of a drilling machine?",
    "options": {
      "A": "To measure surface roughness",
      "B": "To produce holes",
      "C": "To heat-treat components"
    },
    "correctAnswer": "B"
  },
  {
    "id": 7,
    "section": "Manufacturing Fundamentals",
    "question": "Which manufacturing process involves pouring molten metal into a mould?",
    "options": {
      "A": "Grinding",
      "B": "Turning",
      "C": "Casting"
    },
    "correctAnswer": "C"
  },
  {
    "id": 8,
    "section": "Manufacturing Fundamentals",
    "question": "What is forging?",
    "options": {
      "A": "Shaping material using compressive force",
      "B": "Removing material using an abrasive wheel only",
      "C": "Joining parts using adhesive only"
    },
    "correctAnswer": "A"
  },
  {
    "id": 9,
    "section": "Manufacturing Fundamentals",
    "question": "Which process is primarily used to join two metal components permanently?",
    "options": {
      "A": "Turning",
      "B": "Welding",
      "C": "Reaming"
    },
    "correctAnswer": "B"
  },
  {
    "id": 10,
    "section": "Manufacturing Fundamentals",
    "question": "What is the purpose of grinding in manufacturing?",
    "options": {
      "A": "To improve surface finish and dimensional accuracy",
      "B": "To increase component weight",
      "C": "To create raw material from ore"
    },
    "correctAnswer": "A"
  },
  {
    "id": 11,
    "section": "Engineering Materials and Tools",
    "question": "Which of the following is a ferrous metal?",
    "options": {
      "A": "Aluminium",
      "B": "Cast iron",
      "C": "Copper"
    },
    "correctAnswer": "B"
  },
  {
    "id": 12,
    "section": "Engineering Materials and Tools",
    "question": "Which metal is known for its low density and good corrosion resistance?",
    "options": {
      "A": "Aluminium",
      "B": "Lead",
      "C": "Cast iron"
    },
    "correctAnswer": "A"
  },
  {
    "id": 13,
    "section": "Engineering Materials and Tools",
    "question": "What is the main purpose of heat treatment?",
    "options": {
      "A": "To change the material's properties",
      "B": "To change the component's colour only",
      "C": "To increase its size permanently"
    },
    "correctAnswer": "A"
  },
  {
    "id": 14,
    "section": "Engineering Materials and Tools",
    "question": "Which material is commonly used for cutting tools due to its high hardness?",
    "options": {
      "A": "Rubber",
      "B": "Mild steel",
      "C": "Carbide"
    },
    "correctAnswer": "C"
  },
  {
    "id": 15,
    "section": "Engineering Materials and Tools",
    "question": "What is the primary function of a cutting tool in machining?",
    "options": {
      "A": "To remove material from a workpiece",
      "B": "To measure temperature",
      "C": "To hold the machine foundation"
    },
    "correctAnswer": "A"
  },
  {
    "id": 16,
    "section": "Engineering Materials and Tools",
    "question": "Which tool is commonly used to measure an external diameter accurately?",
    "options": {
      "A": "Hammer",
      "B": "Micrometer",
      "C": "Spanner"
    },
    "correctAnswer": "B"
  },
  {
    "id": 17,
    "section": "Engineering Materials and Tools",
    "question": "What is the purpose of a chuck on a lathe?",
    "options": {
      "A": "To cool the cutting tool",
      "B": "To measure the workpiece",
      "C": "To hold the workpiece"
    },
    "correctAnswer": "C"
  },
  {
    "id": 18,
    "section": "Engineering Materials and Tools",
    "question": "Which tool is used to measure an angle?",
    "options": {
      "A": "Bevel protractor",
      "B": "Feeler gauge",
      "C": "Vernier caliper"
    },
    "correctAnswer": "A"
  },
  {
    "id": 19,
    "section": "Engineering Materials and Tools",
    "question": "What is the function of a reamer?",
    "options": {
      "A": "To cut external threads",
      "B": "To finish and size an existing hole accurately",
      "C": "To weld two components"
    },
    "correctAnswer": "B"
  },
  {
    "id": 20,
    "section": "Engineering Materials and Tools",
    "question": "Which tool is commonly used to cut internal or external threads?",
    "options": {
      "A": "Drill bit",
      "B": "Grinding wheel",
      "C": "Tap or die"
    },
    "correctAnswer": "C"
  },
  {
    "id": 21,
    "section": "Quality Control and Measurement",
    "question": "What does QC stand for?",
    "options": {
      "A": "Quantity Calculation",
      "B": "Quality Control",
      "C": "Quick Cutting"
    },
    "correctAnswer": "B"
  },
  {
    "id": 22,
    "section": "Quality Control and Measurement",
    "question": "What is a tolerance in engineering?",
    "options": {
      "A": "The permissible variation in a specified dimension",
      "B": "The weight of a machine",
      "C": "The speed of a conveyor"
    },
    "correctAnswer": "A"
  },
  {
    "id": 23,
    "section": "Quality Control and Measurement",
    "question": "Which instrument is commonly used to measure a component's outside diameter and length?",
    "options": {
      "A": "Thermometer",
      "B": "Tachometer",
      "C": "Vernier caliper"
    },
    "correctAnswer": "C"
  },
  {
    "id": 24,
    "section": "Quality Control and Measurement",
    "question": "What does a surface roughness value such as Ra indicate?",
    "options": {
      "A": "Material hardness",
      "B": "Surface texture or roughness",
      "C": "Component weight"
    },
    "correctAnswer": "B"
  },
  {
    "id": 25,
    "section": "Quality Control and Measurement",
    "question": "What is the purpose of a go/no-go gauge?",
    "options": {
      "A": "To check whether a feature meets specified dimensional limits",
      "B": "To measure electrical power",
      "C": "To polish a surface"
    },
    "correctAnswer": "A"
  },
  {
    "id": 26,
    "section": "Quality Control and Measurement",
    "question": "What is calibration?",
    "options": {
      "A": "Replacing all machine parts",
      "B": "Increasing production speed",
      "C": "Comparing a measuring instrument against a suitable reference standard"
    },
    "correctAnswer": "C"
  },
  {
    "id": 27,
    "section": "Quality Control and Measurement",
    "question": "What does a defect in a manufactured component mean?",
    "options": {
      "A": "The component is always oversized",
      "B": "The component has a nonconformity or flaw",
      "C": "The component has been packed"
    },
    "correctAnswer": "B"
  },
  {
    "id": 28,
    "section": "Quality Control and Measurement",
    "question": "What is the purpose of inspection during production?",
    "options": {
      "A": "To identify deviations and verify requirements",
      "B": "To increase raw material consumption",
      "C": "To avoid using drawings"
    },
    "correctAnswer": "A"
  },
  {
    "id": 29,
    "section": "Quality Control and Measurement",
    "question": "What does ISO 9001 primarily relate to?",
    "options": {
      "A": "Welding machine design",
      "B": "Automotive fuel economy",
      "C": "Quality management systems"
    },
    "correctAnswer": "C"
  },
  {
    "id": 30,
    "section": "Quality Control and Measurement",
    "question": "What is a first-piece inspection?",
    "options": {
      "A": "Inspection of the first component produced in a setup or run",
      "B": "Inspection only after shipment",
      "C": "Inspection of raw material weight only"
    },
    "correctAnswer": "A"
  },
  {
    "id": 31,
    "section": "Industrial Safety and Maintenance",
    "question": "What should an operator wear when required by machine safety rules?",
    "options": {
      "A": "Loose clothing",
      "B": "Appropriate personal protective equipment (PPE)",
      "C": "Open footwear"
    },
    "correctAnswer": "B"
  },
  {
    "id": 32,
    "section": "Industrial Safety and Maintenance",
    "question": "What should be done before carrying out maintenance on a machine?",
    "options": {
      "A": "Increase the machine speed",
      "B": "Remove the safety guards and start the machine",
      "C": "Isolate hazardous energy and follow lockout/tagout procedures"
    },
    "correctAnswer": "C"
  },
  {
    "id": 33,
    "section": "Industrial Safety and Maintenance",
    "question": "What is the main purpose of a machine guard?",
    "options": {
      "A": "To protect operators from moving or hazardous parts",
      "B": "To improve the machine's appearance",
      "C": "To increase cutting speed"
    },
    "correctAnswer": "A"
  },
  {
    "id": 34,
    "section": "Industrial Safety and Maintenance",
    "question": "What should you do if you notice an unsafe condition on the shop floor?",
    "options": {
      "A": "Ignore it if production is running",
      "B": "Report it promptly and follow site safety procedures",
      "C": "Wait until the end of the month"
    },
    "correctAnswer": "B"
  },
  {
    "id": 35,
    "section": "Industrial Safety and Maintenance",
    "question": "Which fire extinguisher type may be suitable for energised electrical equipment, subject to site procedures?",
    "options": {
      "A": "Water jet",
      "B": "Paper-based extinguisher",
      "C": "CO₂ extinguisher"
    },
    "correctAnswer": "C"
  },
  {
    "id": 36,
    "section": "Industrial Safety and Maintenance",
    "question": "Why is housekeeping important in a manufacturing facility?",
    "options": {
      "A": "To reduce slips, trips, contamination and other hazards",
      "B": "To increase machine vibration",
      "C": "To eliminate the need for inspections"
    },
    "correctAnswer": "A"
  },
  {
    "id": 37,
    "section": "Industrial Safety and Maintenance",
    "question": "What is preventive maintenance?",
    "options": {
      "A": "Repairing equipment only after a major failure",
      "B": "Planned maintenance intended to reduce breakdowns",
      "C": "Replacing every machine annually"
    },
    "correctAnswer": "B"
  },
  {
    "id": 38,
    "section": "Industrial Safety and Maintenance",
    "question": "What is the purpose of lubrication in machinery?",
    "options": {
      "A": "To increase friction",
      "B": "To make components heavier",
      "C": "To reduce friction and wear"
    },
    "correctAnswer": "C"
  },
  {
    "id": 39,
    "section": "Industrial Safety and Maintenance",
    "question": "What does 5S primarily help improve in a workplace?",
    "options": {
      "A": "Organisation, cleanliness and workplace efficiency",
      "B": "Raw material prices",
      "C": "Product dimensions automatically"
    },
    "correctAnswer": "A"
  },
  {
    "id": 40,
    "section": "Industrial Safety and Maintenance",
    "question": "What should an operator do if a machine's emergency stop is activated?",
    "options": {
      "A": "Bypass it immediately",
      "B": "Follow the site's safe recovery procedure and investigate the cause",
      "C": "Restart the machine without checking"
    },
    "correctAnswer": "B"
  },
  {
    "id": 41,
    "section": "Production, Productivity and Industrial Awareness",
    "question": "What does productivity generally measure?",
    "options": {
      "A": "Output relative to the resources used",
      "B": "Number of employees only",
      "C": "Total floor area of the factory"
    },
    "correctAnswer": "A"
  },
  {
    "id": 42,
    "section": "Production, Productivity and Industrial Awareness",
    "question": "What is the purpose of a technical engineering drawing?",
    "options": {
      "A": "To advertise the product",
      "B": "To communicate geometry, dimensions and specifications",
      "C": "To record employee attendance"
    },
    "correctAnswer": "B"
  },
  {
    "id": 43,
    "section": "Production, Productivity and Industrial Awareness",
    "question": "What is a Bill of Materials (BOM)?",
    "options": {
      "A": "A list of customer complaints only",
      "B": "A machine operating manual",
      "C": "A list of materials, parts and quantities needed for a product"
    },
    "correctAnswer": "C"
  },
  {
    "id": 44,
    "section": "Production, Productivity and Industrial Awareness",
    "question": "What is the purpose of inventory management?",
    "options": {
      "A": "To maintain suitable stock levels and control materials",
      "B": "To eliminate all documentation",
      "C": "To increase material wastage"
    },
    "correctAnswer": "A"
  },
  {
    "id": 45,
    "section": "Production, Productivity and Industrial Awareness",
    "question": "What does lead time mean in manufacturing?",
    "options": {
      "A": "The time taken to sharpen a tool only",
      "B": "The time between starting a process or order and its completion or delivery, as defined",
      "C": "The age of a machine"
    },
    "correctAnswer": "B"
  },
  {
    "id": 46,
    "section": "Production, Productivity and Industrial Awareness",
    "question": "What is lean manufacturing primarily intended to do?",
    "options": {
      "A": "Increase unnecessary movement",
      "B": "Keep excess stock at all times",
      "C": "Reduce waste and improve value for the customer"
    },
    "correctAnswer": "C"
  },
  {
    "id": 47,
    "section": "Production, Productivity and Industrial Awareness",
    "question": "What is the purpose of a production schedule?",
    "options": {
      "A": "To plan what is produced, when and with which resources",
      "B": "To determine employee holidays only",
      "C": "To replace quality inspections"
    },
    "correctAnswer": "A"
  },
  {
    "id": 48,
    "section": "Production, Productivity and Industrial Awareness",
    "question": "What is traceability in manufacturing?",
    "options": {
      "A": "Measuring the machine's noise only",
      "B": "The ability to track a product or material's history and movement",
      "C": "Recording only the final selling price"
    },
    "correctAnswer": "B"
  },
  {
    "id": 49,
    "section": "Production, Productivity and Industrial Awareness",
    "question": "What is the purpose of a standard operating procedure (SOP)?",
    "options": {
      "A": "To encourage each operator to use a different method",
      "B": "To eliminate safety rules",
      "C": "To provide documented, consistent instructions for carrying out a task"
    },
    "correctAnswer": "C"
  },
  {
    "id": 50,
    "section": "Production, Productivity and Industrial Awareness",
    "question": "What is continuous improvement in manufacturing?",
    "options": {
      "A": "Making ongoing changes to improve processes, quality or efficiency",
      "B": "Never changing an established process",
      "C": "Increasing production regardless of quality"
    },
    "correctAnswer": "A"
  },
  {
    "id": 51,
    "section": "Horizontal Boring Mills (HBM) and Facing Heads",
    "question": "What is the primary purpose of a Horizontal Boring Mill (HBM)?",
    "options": {
      "A": "To manufacture only small plastic components",
      "B": "To machine large components with accurate bores, faces and internal features",
      "C": "To perform only sheet-metal cutting"
    },
    "correctAnswer": "B"
  },
  {
    "id": 52,
    "section": "Horizontal Boring Mills (HBM) and Facing Heads",
    "question": "Which machine axis typically controls the axial position of the cutting tool in a conventional HBM setup for Cogsdill ZX tooling?",
    "options": {
      "A": "Z-axis",
      "B": "X-axis only",
      "C": "A-axis only"
    },
    "correctAnswer": "A"
  },
  {
    "id": 53,
    "section": "Horizontal Boring Mills (HBM) and Facing Heads",
    "question": "What is the function of the programmable inner spindle (W-axis) when using a Cogsdill ZX head?",
    "options": {
      "A": "To rotate the workpiece like a lathe",
      "B": "To control the machine coolant temperature",
      "C": "To actuate the cutting slide radially through the tool's internal mechanism"
    },
    "correctAnswer": "C"
  },
  {
    "id": 54,
    "section": "Horizontal Boring Mills (HBM) and Facing Heads",
    "question": "Which type of HBM is suitable for a Cogsdill ZX system?",
    "options": {
      "A": "A machine with only manual feed and no programmable inner spindle",
      "B": "A machine with a programmable inner spindle and suitable machine/tool interfaces",
      "C": "Any drilling machine, regardless of its controls"
    },
    "correctAnswer": "B"
  },
  {
    "id": 55,
    "section": "Horizontal Boring Mills (HBM) and Facing Heads",
    "question": "What is a major advantage of using a ZX facing head on an HBM?",
    "options": {
      "A": "Performing multiple machining operations without removing the workpiece",
      "B": "Eliminating the need for a CNC programme in every application",
      "C": "Eliminating the need for cutting tools"
    },
    "correctAnswer": "A"
  },
  {
    "id": 56,
    "section": "Horizontal Boring Mills (HBM) and Facing Heads",
    "question": "Which machine manufacturer is among those featured in Cogsdill's published ZX system information?",
    "options": {
      "A": "Whirlpool",
      "B": "Bosch Home Appliances",
      "C": "UNION"
    },
    "correctAnswer": "C"
  },
  {
    "id": 57,
    "section": "Horizontal Boring Mills (HBM) and Facing Heads",
    "question": "What should be checked before selecting a ZX head for an existing HBM?",
    "options": {
      "A": "Only the machine's paint colour",
      "B": "Spindle interface, programmable W-axis capability, travel, speed and application requirements",
      "C": "Only the factory's electrical lighting"
    },
    "correctAnswer": "B"
  },
  {
    "id": 58,
    "section": "Horizontal Boring Mills (HBM) and Facing Heads",
    "question": "Why is synchronisation between the inner spindle and outer spindle important for ZX tooling?",
    "options": {
      "A": "It enables the tool's radial movement to be controlled while the head rotates",
      "B": "It automatically changes the workpiece material",
      "C": "It removes the need for machine-axis positioning"
    },
    "correctAnswer": "A"
  },
  {
    "id": 59,
    "section": "Horizontal Boring Mills (HBM) and Facing Heads",
    "question": "What is the main purpose of a facing head?",
    "options": {
      "A": "To measure surface hardness",
      "B": "To cut external threads only",
      "C": "To machine a face by moving the cutting tool radially"
    },
    "correctAnswer": "C"
  },
  {
    "id": 60,
    "section": "Horizontal Boring Mills (HBM) and Facing Heads",
    "question": "Which operation can a Cogsdill ZX facing and contouring head perform with suitable tooling?",
    "options": {
      "A": "Heat treatment",
      "B": "Internal boring, facing, taper boring and contouring",
      "C": "Casting molten metal"
    },
    "correctAnswer": "B"
  },
  {
    "id": 61,
    "section": "Horizontal Boring Mills (HBM) and Facing Heads",
    "question": "What does radial stroke mean in a facing head?",
    "options": {
      "A": "The distance the cutting slide can move radially",
      "B": "The length of the machine's electrical cable",
      "C": "The height of the workholding table"
    },
    "correctAnswer": "A"
  },
  {
    "id": 62,
    "section": "Horizontal Boring Mills (HBM) and Facing Heads",
    "question": "Which ZX model has a nominal tool-slide length of 300 mm?",
    "options": {
      "A": "ZX200",
      "B": "ZX420",
      "C": "ZX300"
    },
    "correctAnswer": "C"
  },
  {
    "id": 63,
    "section": "Horizontal Boring Mills (HBM) and Facing Heads",
    "question": "Which operation involves machining a groove inside a component?",
    "options": {
      "A": "Welding",
      "B": "Internal grooving",
      "C": "Shot blasting"
    },
    "correctAnswer": "B"
  },
  {
    "id": 64,
    "section": "Horizontal Boring Mills (HBM) and Facing Heads",
    "question": "Why is a facing head useful when machining large valve bodies?",
    "options": {
      "A": "It can machine internal faces, recesses and profiles using appropriate tooling",
      "B": "It eliminates all inspection requirements",
      "C": "It makes every valve body identical without machining"
    },
    "correctAnswer": "A"
  },
  {
    "id": 65,
    "section": "Horizontal Boring Mills (HBM) and Facing Heads",
    "question": "What is taper boring?",
    "options": {
      "A": "Drilling a series of unrelated holes",
      "B": "Grinding the outside of a workpiece",
      "C": "Machining a bore with a gradually changing diameter"
    },
    "correctAnswer": "C"
  },
  {
    "id": 66,
    "section": "Horizontal Boring Mills (HBM) and Facing Heads",
    "question": "What is the purpose of contouring with a programmable boring head?",
    "options": {
      "A": "To produce only straight cylindrical holes",
      "B": "To machine a programmed profile, radius or changing internal geometry",
      "C": "To measure the weight of a component"
    },
    "correctAnswer": "B"
  },
  {
    "id": 67,
    "section": "Horizontal Boring Mills (HBM) and Facing Heads",
    "question": "What is a key benefit of using qualified tool-location points on a ZX head?",
    "options": {
      "A": "More repeatable tool setups",
      "B": "Automatic replacement of worn inserts",
      "C": "Elimination of all cutting forces"
    },
    "correctAnswer": "A"
  },
  {
    "id": 68,
    "section": "Horizontal Boring Mills (HBM) and Facing Heads",
    "question": "Why might a manufacturer choose a larger ZX head, such as the ZX900, rather than a smaller model?",
    "options": {
      "A": "The ZX900 is suitable for every machine without compatibility checks",
      "B": "A larger head always provides a higher maximum spindle speed",
      "C": "The application may require a greater working diameter or radial reach, subject to machine and tooling limits"
    },
    "correctAnswer": "C"
  },
  {
    "id": 69,
    "section": "Valve Seat Pockets and Oil & Gas Applications",
    "question": "What is a valve seat pocket?",
    "options": {
      "A": "An electrical connection on a machine",
      "B": "A machined cavity or seating area inside a valve body",
      "C": "A storage compartment for cutting inserts"
    },
    "correctAnswer": "B"
  },
  {
    "id": 70,
    "section": "Valve Seat Pockets and Oil & Gas Applications",
    "question": "Why can valve seat pocket machining be challenging?",
    "options": {
      "A": "It can involve interrupted cuts, long tool reach and difficult internal geometries",
      "B": "It never requires dimensional accuracy",
      "C": "It involves machining only flat external surfaces"
    },
    "correctAnswer": "A"
  },
  {
    "id": 71,
    "section": "Valve Seat Pockets and Oil & Gas Applications",
    "question": "Which material is commonly encountered in demanding oil and gas valve seat pocket applications?",
    "options": {
      "A": "Cardboard",
      "B": "Soft rubber",
      "C": "Inconel"
    },
    "correctAnswer": "C"
  },
  {
    "id": 72,
    "section": "Valve Seat Pockets and Oil & Gas Applications",
    "question": "What is the benefit of a piloted support system in a valve seat pocket tool?",
    "options": {
      "A": "It increases the workpiece temperature",
      "B": "It helps support and guide the tool during extended-reach machining",
      "C": "It replaces the machine spindle"
    },
    "correctAnswer": "B"
  },
  {
    "id": 73,
    "section": "Valve Seat Pockets and Oil & Gas Applications",
    "question": "Why might a manufacturer machine a valve seat pocket before and after weld cladding?",
    "options": {
      "A": "To rough-machine the cavity before cladding and finish-machine the required geometry afterwards",
      "B": "To eliminate all material removal",
      "C": "To avoid measuring the finished pocket"
    },
    "correctAnswer": "A"
  },
  {
    "id": 74,
    "section": "Valve Seat Pockets and Oil & Gas Applications",
    "question": "Which component is a typical candidate for complex internal contouring in the oil and gas industry?",
    "options": {
      "A": "Office furniture",
      "B": "Packaging cartons",
      "C": "Oilfield valve bodies"
    },
    "correctAnswer": "C"
  },
  {
    "id": 75,
    "section": "Valve Seat Pockets and Oil & Gas Applications",
    "question": "What is one advantage of machining multiple internal features in a single setup?",
    "options": {
      "A": "It guarantees zero tool wear",
      "B": "It can reduce setup time and improve positional consistency between features",
      "C": "It removes the need for a drawing"
    },
    "correctAnswer": "B"
  },
  {
    "id": 76,
    "section": "Valve Seat Pockets and Oil & Gas Applications",
    "question": "Which operation may be required when machining complex valve internals?",
    "options": {
      "A": "Boring, facing, tapering and internal profiling",
      "B": "Only painting",
      "C": "Only external polishing"
    },
    "correctAnswer": "A"
  },
  {
    "id": 77,
    "section": "Bottle Boring and Modular Boring Tools",
    "question": "What is bottle boring?",
    "options": {
      "A": "Drilling a standard shallow hole",
      "B": "Machining the outside of a bottle-shaped product",
      "C": "Machining an internal cavity with a narrow entry and a wider or more complex internal profile"
    },
    "correctAnswer": "C"
  },
  {
    "id": 78,
    "section": "Bottle Boring and Modular Boring Tools",
    "question": "Which component might require bottle boring?",
    "options": {
      "A": "A flat sheet-metal panel",
      "B": "A component with a deep internal cavity or undercut that cannot be reached by a conventional straight boring bar",
      "C": "A plastic label"
    },
    "correctAnswer": "B"
  },
  {
    "id": 79,
    "section": "Bottle Boring and Modular Boring Tools",
    "question": "What is a major advantage of a Cogsdill ZX bottle boring tool?",
    "options": {
      "A": "It can machine complex internal shapes and bore transitions",
      "B": "It can only produce external threads",
      "C": "It operates without a machine tool"
    },
    "correctAnswer": "A"
  },
  {
    "id": 80,
    "section": "Bottle Boring and Modular Boring Tools",
    "question": "What is the role of a pilot system in a bottle boring tool?",
    "options": {
      "A": "To control the factory's compressed-air system",
      "B": "To measure the operator's working hours",
      "C": "To support and guide the tool within the bore"
    },
    "correctAnswer": "C"
  },
  {
    "id": 81,
    "section": "Bottle Boring and Modular Boring Tools",
    "question": "What does MBT stand for in Cogsdill's ZX product range?",
    "options": {
      "A": "Machine Balancing Technology",
      "B": "Modular Boring Tool",
      "C": "Manual Boring Table"
    },
    "correctAnswer": "B"
  },
  {
    "id": 82,
    "section": "Bottle Boring and Modular Boring Tools",
    "question": "Which of the following is an application for a Cogsdill Modular Boring Tool?",
    "options": {
      "A": "Boring, counterboring, tapering and internal contouring",
      "B": "Painting components",
      "C": "Measuring room humidity"
    },
    "correctAnswer": "A"
  },
  {
    "id": 83,
    "section": "Bottle Boring and Modular Boring Tools",
    "question": "What is a benefit of modular tooling?",
    "options": {
      "A": "It requires a completely different machine for every operation",
      "B": "It eliminates the need to select suitable cutting inserts",
      "C": "It allows suitable tooling components to be configured for different applications"
    },
    "correctAnswer": "C"
  },
  {
    "id": 84,
    "section": "Bottle Boring and Modular Boring Tools",
    "question": "Besides HBMs, which machine types may be considered for adapted bottle boring tools, subject to application and interface compatibility?",
    "options": {
      "A": "Only conventional hand drills",
      "B": "Deep-hole drilling machines, mill-turn machines and suitable horizontal or vertical lathes",
      "C": "Only surface grinding machines"
    },
    "correctAnswer": "B"
  },
  {
    "id": 85,
    "section": "Programmable Boring Heads and CNC Programming",
    "question": "What is the key function of a programmable boring or facing head?",
    "options": {
      "A": "To convert programmed machine-axis movement into controlled cutting-tool movement",
      "B": "To change the workpiece material automatically",
      "C": "To eliminate CNC control"
    },
    "correctAnswer": "A"
  },
  {
    "id": 86,
    "section": "Programmable Boring Heads and CNC Programming",
    "question": "Which two axes are commonly used to programme a conventional Cogsdill ZX application on a suitable HBM?",
    "options": {
      "A": "A-axis and B-axis only",
      "B": "X-axis and Y-axis only",
      "C": "W-axis and Z-axis"
    },
    "correctAnswer": "C"
  },
  {
    "id": 87,
    "section": "Programmable Boring Heads and CNC Programming",
    "question": "What is the benefit of changing a CNC programme rather than manually adjusting a tool for every part variation?",
    "options": {
      "A": "It removes the need for tooling checks",
      "B": "It can make repeatable changes to the machined profile and reduce manual intervention",
      "C": "It guarantees that every component will pass inspection"
    },
    "correctAnswer": "B"
  },
  {
    "id": 88,
    "section": "Programmable Boring Heads and CNC Programming",
    "question": "What does the actuation ratio of a boring head describe?",
    "options": {
      "A": "The relationship between actuator movement and radial cutting-slide movement",
      "B": "The ratio of employees to machines",
      "C": "The ratio of coolant to cutting oil in every application"
    },
    "correctAnswer": "A"
  },
  {
    "id": 89,
    "section": "Programmable Boring Heads and CNC Programming",
    "question": "Why is backlash control important in a programmable facing head?",
    "options": {
      "A": "It increases the machine's electrical power consumption",
      "B": "It eliminates the need for correct tool setup",
      "C": "It helps maintain predictable tool positioning and repeatability"
    },
    "correctAnswer": "C"
  },
  {
    "id": 90,
    "section": "Programmable Boring Heads and CNC Programming",
    "question": "What should be considered when preparing a CNC programme for a ZX head?",
    "options": {
      "A": "Only the colour of the machine",
      "B": "The head's actuation ratio, required diameter, axis movements, feeds, speeds and machine-specific programming requirements",
      "C": "Only the number of operators in the workshop"
    },
    "correctAnswer": "B"
  },
  {
    "id": 91,
    "section": "Programmable Boring Heads and CNC Programming",
    "question": "What is the main advantage of through-tool coolant in deep internal machining?",
    "options": {
      "A": "It can assist cutting-edge cooling and chip evacuation",
      "B": "It removes the need for cutting inserts",
      "C": "It guarantees that no chips will ever remain in the bore"
    },
    "correctAnswer": "A"
  },
  {
    "id": 92,
    "section": "Programmable Boring Heads and CNC Programming",
    "question": "What must be verified before running a new programme with a programmable boring head?",
    "options": {
      "A": "Only the machine's production target",
      "B": "Only the operator's shift timing",
      "C": "Axis travel, tool clearances, programme logic, speeds and feeds, and safe operation"
    },
    "correctAnswer": "C"
  },
  {
    "id": 93,
    "section": "Cogsdill as a Company and ZX System Selection",
    "question": "Which company manufactures the ZX facing, contouring and modular boring tool systems discussed in this quiz?",
    "options": {
      "A": "Sandvik Coromant",
      "B": "Cogsdill",
      "C": "Mitsubishi Electric"
    },
    "correctAnswer": "B"
  },
  {
    "id": 94,
    "section": "Cogsdill as a Company and ZX System Selection",
    "question": "Which of the following best describes Cogsdill's ZX product range?",
    "options": {
      "A": "Specialist tooling systems for boring, facing, contouring and related machining operations",
      "B": "A range of welding robots only",
      "C": "A range of industrial paints"
    },
    "correctAnswer": "A"
  },
  {
    "id": 95,
    "section": "Cogsdill as a Company and ZX System Selection",
    "question": "What is the main objective of the Cogsdill ZX system?",
    "options": {
      "A": "To replace every machine tool in a factory",
      "B": "To eliminate the need for CNC programming in all applications",
      "C": "To expand machining capability and productivity through programmable tooling"
    },
    "correctAnswer": "C"
  },
  {
    "id": 96,
    "section": "Cogsdill as a Company and ZX System Selection",
    "question": "Which industry is a relevant target market for Cogsdill ZX systems?",
    "options": {
      "A": "Food packaging alone",
      "B": "Oil and gas, including the machining of large valve components",
      "C": "Office stationery manufacturing alone"
    },
    "correctAnswer": "B"
  },
  {
    "id": 97,
    "section": "Cogsdill as a Company and ZX System Selection",
    "question": "Which ZX head would be a potential candidate when a job requires a maximum facing diameter of approximately 800 mm, subject to application requirements?",
    "options": {
      "A": "ZX300",
      "B": "ZX200",
      "C": "ZX900 only"
    },
    "correctAnswer": "A"
  },
  {
    "id": 98,
    "section": "Cogsdill as a Company and ZX System Selection",
    "question": "What is the maximum published facing diameter of the ZX900 facing and contouring head?",
    "options": {
      "A": "800 mm",
      "B": "1,060 mm",
      "C": "1,700 mm"
    },
    "correctAnswer": "C"
  },
  {
    "id": 99,
    "section": "Cogsdill as a Company and ZX System Selection",
    "question": "Which statement about using a ZX head on a CNC machine is correct?",
    "options": {
      "A": "Any CNC machine can accept any ZX head without modification",
      "B": "Compatibility depends on machine axes, spindle interface, control capability and application requirements",
      "C": "The machine's spindle and control system do not matter"
    },
    "correctAnswer": "B"
  },
  {
    "id": 100,
    "section": "Cogsdill as a Company and ZX System Selection",
    "question": "What is the best first step when a customer asks whether a Cogsdill ZX system can machine their component?",
    "options": {
      "A": "Review the component drawing, material, features, tolerances, machine details and production requirements",
      "B": "Recommend the largest available head without further checks",
      "C": "Select a tool based only on the component's outside diameter"
    },
    "correctAnswer": "A"
  }
];

export const QUIZ_SECTIONS = [
  'Manufacturing Fundamentals',
  'Engineering Materials and Tools',
  'Quality Control and Measurement',
  'Industrial Safety and Maintenance',
  'Production, Productivity and Industrial Awareness',
  'Horizontal Boring Mills (HBM) and Facing Heads',
  'Valve Seat Pockets and Oil & Gas Applications',
  'Bottle Boring and Modular Boring Tools',
  'Programmable Boring Heads and CNC Programming',
  'Cogsdill as a Company and ZX System Selection'
] as const;

// Track active and completed quiz attempts to prevent duplicate submissions
export interface CompletedAttemptRecord {
  score: number;
  maxScore: 10;
  phone?: string;
  completedAt: string;
}

const activeAttempts = new Map<string, { questionIds: number[]; createdAt: number; phone?: string }>();
const completedAttempts = new Map<string, CompletedAttemptRecord>();

/**
 * Fisher-Yates array shuffle.
 */
function shuffleArray<T>(arr: readonly T[] | T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Generate a randomized quiz attempt:
 * 1. 10 questions total in every quiz.
 * 2. Exactly 1 question sampled from each of the 5 General Manufacturing sections (5 questions).
 * 3. Exactly 1 question sampled from 5 randomly selected Cogsdill sections (5 questions).
 * 4. Exactly 10 distinct sections represented in every 10-question quiz.
 * 5. Randomized presentation order.
 * 6. Exactly 3 selectable options per question.
 * 7. Strips correctAnswer so frontend never receives answers.
 */
export function generateRandomQuizAttempt(normalizedPhone?: string): QuizAttemptInfo {
  const bySection = new Map<string, Question[]>();
  for (const q of MASTER_QUESTION_BANK) {
    const sec = q.section;
    if (!bySection.has(sec)) bySection.set(sec, []);
    bySection.get(sec)!.push(q);
  }

  const selectedQuestions: Question[] = [];

  // Sample exactly 1 question from each of the 10 sections
  for (const secName of QUIZ_SECTIONS) {
    const sectionQuestions = bySection.get(secName);
    if (!sectionQuestions || sectionQuestions.length === 0) {
      throw new Error(`Section "${secName}" has no questions`);
    }
    const shuffled = shuffleArray(sectionQuestions);
    selectedQuestions.push(shuffled[0]);
  }

  // Total must be exactly 10
  if (selectedQuestions.length !== 10) {
    throw new Error(`Expected exactly 10 selected questions, got ${selectedQuestions.length}`);
  }

  // Randomize the presentation order of the 10 questions
  const randomizedQuestions = shuffleArray(selectedQuestions);

  // Generate unique quiz attempt ID
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
  const attemptId = `ATTEMPT-${dateStr}-${randomSuffix}`;

  // Store in active registry with associated phone
  activeAttempts.set(attemptId, {
    questionIds: randomizedQuestions.map(q => q.id),
    createdAt: Date.now(),
    phone: normalizedPhone
  });

  // Strip correctAnswer for public client transmission
  const clientQuestions: ClientQuestion[] = randomizedQuestions.map(
    ({ correctAnswer, ...sanitized }) => sanitized
  );

  return {
    attemptId,
    questions: clientQuestions,
    total: clientQuestions.length
  };
}

export function isAttemptAlreadyCompleted(attemptId: string): boolean {
  return completedAttempts.has(attemptId);
}

export function getCompletedAttemptData(attemptId: string): CompletedAttemptRecord | undefined {
  return completedAttempts.get(attemptId);
}

/**
 * Authoritative server-side grading and duplicate prevention.
 * Throws an error if the attempt has already been submitted.
 * Returns only the final total score (0 to 10) and maximum score of 10.
 */
export function gradeAndFinalizeAttempt(
  attemptId: string,
  answers: any
): { score: number; maxScore: 10 } {
  // 1. Guard against duplicate submissions
  if (completedAttempts.has(attemptId)) {
    const cached = completedAttempts.get(attemptId)!;
    return {
      score: cached.score,
      maxScore: cached.maxScore
    };
  }

  // Lookup question map
  const questionMap = new Map<number, Question>();
  MASTER_QUESTION_BANK.forEach(q => questionMap.set(q.id, q));

  // Normalize answers into a Map<number, string>
  const answerMap = new Map<number, string>();
  if (Array.isArray(answers)) {
    for (const item of answers) {
      const qId = Number(item?.questionId ?? item?.id);
      const val = String(item?.selectedOption ?? item?.answer ?? item?.option ?? '');
      if (qId && val) answerMap.set(qId, val);
    }
  } else if (answers && typeof answers === 'object') {
    for (const [k, v] of Object.entries(answers)) {
      const qId = Number(k);
      const val = typeof v === 'string' ? v : (v as any)?.selectedOption ?? (v as any)?.answer ?? '';
      if (qId && val) answerMap.set(qId, String(val));
    }
  }

  // Determine question set for this attempt
  const attemptData = activeAttempts.get(attemptId);
  const questionIds = attemptData
    ? attemptData.questionIds
    : Array.from(answerMap.keys());

  // Calculate score: +1 for each correct answer
  let score = 0;
  for (const qId of questionIds) {
    const q = questionMap.get(qId);
    if (!q) continue;

    const userAns = answerMap.get(qId);
    if (userAns && userAns.toUpperCase() === q.correctAnswer) {
      score += 1;
    }
  }

  // Clamp score strictly between 0 and 10
  score = Math.max(0, Math.min(10, score));

  // Mark attempt as completed to permanently block duplicate submissions
  completedAttempts.set(attemptId, {
    score,
    maxScore: 10,
    phone: attemptData?.phone,
    completedAt: new Date().toISOString()
  });
  activeAttempts.delete(attemptId);

  return {
    score,
    maxScore: 10
  };
}

/**
 * Get sanitized client questions (correctAnswer strictly stripped).
 */
export function getClientQuestions(countParam?: number | string): ClientQuestion[] {
  const res = generateRandomQuizAttempt();
  return res.questions;
}
