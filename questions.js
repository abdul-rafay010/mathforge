// ═══════════════════════════════════════════════════════════════════
//  QUESTION BANK — Cambridge A-Level & Further Mathematics
//
//  All questions are challenging. All content is image-based.
//
//  Each question follows this format:
//  {
//    id:               "P1_CG_001",          ← unique, no spaces
//    question_image:   "P1_CG_001_q.png",    ← file in /images/
//    solution_image:   "P1_CG_001_s.png",    ← file in /images/
//  }
//
//  Add your iPad exports to the /images/ folder.
//  Name them exactly as written in question_image / solution_image.
// ═══════════════════════════════════════════════════════════════════

const SYLLABUS = {

  "9709": {
    name: "Mathematics",
    code: "9709",
    sections: {

      "P1": {
        name: "Pure Mathematics 1",
        topics: {
          "Coordinate Geometry":            [],
          "Trigonometry":                   [],
          "Binomial Expansion":             [],
          "Differentiation":                [],
          "Quadratics":                     [],
          "Integration":                    [],
          "Sequences & Series":             [],
          "Functions":                      [],
          "Circular Measure":               []
        }
      },

      "P3": {
        name: "Pure Mathematics 3",
        topics: {
          "Algebra":                        [],
          "Logarithmic & Exp Functions":    [],
          "Trigonometry":                   [],
          "Differentiation":                [],
          "Integration":                    [],
          "Numerical Methods":              [],
          "Vectors":                        [],
          "Differential Equations":         [],
          "Complex Numbers":                []
        }
      },

      "S1": {
        name: "Statistics 1",
        topics: {
          "Representation of Data":         [],
          "Permutations & Combinations":    [],
          "Probability":                    [],
          "Discrete Random Variables":      [],
          "Normal Distribution":            []
        }
      },

      "S2": {
        name: "Statistics 2",
        topics: {
          "Poisson Distribution":           [],
          "Linear Combinations":            [],
          "Continuous Random Variables":    [],
          "Sampling & Estimation":          [],
          "Hypothesis Testing":             []
        }
      },

      "M1": {
        name: "Mechanics 1",
        topics: {
          "Forces & Equilibrium":           [],
          "Kinematics":                     [],
          "Newton's Laws of Motion":        [],
          "Energy, Work & Power":           [],
          "Momentum":                       []
        }
      },

      "M2": {
        name: "Mechanics 2",
        topics: {
          "Projectile Motion":              [],
          "Equilibrium of a Rigid Body":    [],
          "Circular Motion":               [],
          "Hooke's Law":                    [],
          "Linear Motion (Variable Force)": []
        }
      }
    }
  },

  "9231": {
    name: "Further Mathematics",
    code: "9231",
    sections: {

      "FP1": {
        name: "Further Pure 1",
        topics: {
          "Rational Functions":             [],
          "Series":                         [],
          "Roots of Polynomials": [
            {
              id: "FP1_RP_001",
              question_image: "FP1_RP_001_q.png",
              solution_image: "FP1_RP_001_s.png"
            }
           ],
          "Polar Coordinates":              [],
          "Vectors — Lines & Planes":       [],
          "Proof by Induction":             [],
          "Matrices":                       []
        }
      },

      "FP2": {
        name: "Further Pure 2",
        topics: {
          "Hyperbolic Functions":           [],
          "Differentiation":                [],
          "Complex Numbers":                [],
          "Matrices":                       [],
          "Integration":                    [],
          "Differential Equations":         []
        }
      },

      "FS": {
        name: "Further Statistics",
        topics: {
          "Continuous Random Variables":    [],
          "Inference":                      [],
          "Chi-squared Tests":              [],
          "Non-parametric Tests":           []
        }
      },

      "FM": {
        name: "Further Mechanics",
        topics: {
          "Resisted Motion":                [],
          "Elastic Strings & Springs":      [],
          "Simple Harmonic Motion":         [],
          "Further Circular Motion":        []
        }
      }
    }
  }

};
