const SYLLABUS = {

  "9709": {
    name: "Mathematics",
    code: "9709",
    sections: {

      "P1": {
        name: "Pure Mathematics 1",
        topics: {
          "Coordinate Geometry":  [],
          "Trigonometry":         [],
          "Binomial Expansion":   [],
          "Differentiation":      [],
          "Quadratics":           [],

          "Integration": [
            {
              id: "P1_IN_001",
              question_text: "The point $A$ with $x$-coordinate $2$ lies on the curve $y = \\sqrt{4x+1}$. The diagram shows part of this curve and the tangent to the curve at $A$.\n\nFind the area of the shaded region enclosed by the curve, the tangent and the $x$-axis. $\\quad$ **[10]**",
              solution_image: ""
            }
          ],

          "Sequences & Series": [
            {
              id: "P1_SS_001",
              question_text: "An arithmetic progression has common difference $d$. The 3rd term of this progression is $10$.\n\n**(a)** Write down expressions for the 1st term and the 2nd term of this progression. Give your answers in terms of $d$ only. $\\quad$ **[2]**\n\n**(b)** When each of the first 3 terms is squared, the sum of these squares is $140$. There are two possible values for $d$.\n\nUsing your answer to part **(a)**, find the sum of the first 200 terms of the progression with the smaller value of $d$. $\\quad$ **[7]**",
              solution_image: ""
            }
          ],

          "Functions":        [],
          "Circular Measure": []
        }
      },

      "P3": {
        name: "Pure Mathematics 3",
        topics: {
          "Algebra":                     [],
          "Logarithmic & Exp Functions": [],
          "Trigonometry":                [],
          "Differentiation":             [],
          "Integration":                 [],
          "Numerical Methods":           [],
          "Vectors":                     [],
          "Differential Equations":      [],
          "Complex Numbers":             []
        }
      },

      "S1": {
        name: "Statistics 1",
        topics: {
          "Representation of Data":      [],
          "Permutations & Combinations": [],
          "Probability":                 [],
          "Discrete Random Variables":   [],
          "Normal Distribution":         []
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
          "Rational Functions": [],
          "Series":             [],

          "Roots of Polynomials": [
            {
              id: "FP1_RP_001",
              question_text: "The quartic equation $3072x^4 - 2880x^3 + 840x^2 - 90x + 3 = 0$ has roots $\\alpha$, $r\\alpha$, $r^2\\alpha$ and $r^3\\alpha$ for some real constant $r$.\n\nSolve the equation. $\\quad$ **[7]**",
              solution_image: "FP1_RP_001_s.png"
            }
          ],

          "Polar Coordinates": [],

          "Vectors — Lines & Planes": [
            {
              id: "FP1_VL_001",
              question_text: "Find a vector $\\boldsymbol{v}$ which has the following properties:\n\n- It is a unit vector.\n- It is parallel to the plane $2x + 2y + z = 10$.\n- It makes an angle of $45°$ with the normal to the plane $x + z = 5$.\n\n$\\quad$ **(8)**",
              solution_image: ""
            }
          ],

          "Proof by Induction": [
            {
              id: "FP1_PI_001",
              question_text: "You are given the matrix\n$$\\mathbf{A} = \\begin{pmatrix} 3 & 2 \\\\ 1 & 4 \\end{pmatrix}$$\nwhich represents the transformation $\\mathbf{T}$ in the $x$-$y$ plane.\n\n**(a)** Find the equations of the invariant lines of $\\mathbf{T}$. $\\quad$ **[4]**\n\n**(b)** Prove by mathematical induction that\n$$\\mathbf{A}^n = \\frac{1}{3}\\begin{pmatrix} 2^{n+1}+5^n & 2\\cdot 5^n - 2^{n+1} \\\\ 5^n - 2^n & 2^n + 2\\cdot 5^n \\end{pmatrix}$$\nfor all integers $n \\geq 1$. $\\quad$ **[5]**\n\n**(c)** Find the number of successive transformations of $\\mathbf{T}$ applied on the point $(-1,\\,4)$ so that it maps onto $(910605,\\,911885)$. $\\quad$ **[2]**",
              solution_image: ""
            },
            {
              id: "FP1_PI_002",
              question_text: "**Q1.** Prove by induction that $n! > n^2 + n$ for all integers $n \\geq 4$.\n\n**Q2.** Prove by induction that $2^n > n^2$ for all integers $n \\geq 5$.\n\n**Q3.** Prove by induction that $3^n > 5 \\times 2^n$ for all integers $n \\geq 4$.",
              solution_image: ""
            },
            {
              id: "FP1_PI_003",
              question_text: "Given\n$$\\mathbf{A} = \\begin{pmatrix} 1 & 0 \\\\ 2 & 1 \\end{pmatrix}$$\nProve by induction that\n$$\\mathbf{A}^n = n\\mathbf{A} - (n-1)\\mathbf{I}$$\nwhere $n \\geq 1$, $n \\in \\mathbb{N}$, and $\\mathbf{I}$ represents the identity matrix. $\\quad$ **(6)**",
              solution_image: ""
            },
            {
              id: "FP1_PI_004",
              question_text: "Prove by mathematical induction that, for all positive integers $n$,\n$$1 + 2x + 3x^2 + \\ldots + nx^{n-1} = \\frac{1-(n+1)x^n+nx^{n+1}}{(1-x)^2}$$\n$\\quad$ **[6]**",
              solution_image: ""
            },
            {
              id: "FP1_PI_005",
              question_text: "Prove by induction that for all integers $n \\geq 2$:\n$$\\sum_{k=1}^{n} \\frac{1}{k^2} \\leq 2 - \\frac{1}{n}$$",
              solution_image: ""
            },
            {
              id: "FP1_PI_007",
              question_text: "Prove by induction that\n$$\\sum_{r=1}^{n} \\left[r(r+1)\\left(\\frac{1}{2}\\right)^{r-1}\\right] = 16 - \\left(\\frac{1}{2}\\right)^{n-1}(n^2+5n+8)$$\nfor all $n \\geq 1$, $n \\in \\mathbb{N}$.",
              solution_image: ""
            },
            {
              id: "FP1_PI_008",
              question_text: "Let $f(n) = 3^{2n+4} - 2^{2n}$, $\\quad n \\in \\mathbb{N}$.\n\nProve by induction that $f(n)$ is divisible by $5$ for all $n \\in \\mathbb{N}$.",
              solution_image: ""
            },
            {
              id: "FP1_PI_009",
              question_text: "A sequence of numbers is given by the recurrence relation\n$$u_{n+1} = \\frac{u_n - 5}{3u_n - 7}, \\quad u_1 = -1, \\quad n \\in \\mathbb{N},\\ n \\geq 1$$\n\nProve by induction that the $n^{\\text{th}}$ term of the sequence is given by\n$$u_n = \\frac{2^{n+1}-5}{2^{n+1}-3}$$",
              solution_image: ""
            },
            {
              id: "FP1_PI_010",
              question_text: "Prove by induction that for all even natural numbers $n$,\n$$\\frac{d^n}{dx^n}(\\sin 3x) = (-1)^{\\frac{n}{2}} \\times 3^n \\times \\sin 3x$$",
              solution_image: ""
            },
            {
              id: "FP1_PI_011",
              question_text: "Prove by induction that\n$$\\frac{d^n}{dx^n}\\!\\left(e^x \\sin(\\sqrt{3}\\,x)\\right) = 2^n e^x \\sin\\!\\left(\\sqrt{3}\\,x + \\frac{n\\pi}{3}\\right)$$\nfor all $n \\geq 1$, $n \\in \\mathbb{N}$.",
              solution_image: ""
            }
          ],

          "Matrices": []
        }
      },

      "FS": {
        name: "Further Statistics",
        topics: {
          "Continuous Random Variables": [],

          "Discrete Random Variables (PGF)": [
            {
              id: "FS_DRV_001",
              question_text: "The probability generating function of the random variable $X$ is\n$$G_X(t) = \\frac{1}{81}\\left(t + \\frac{2}{t}\\right)^4$$\n\n**(i)** Use the probability generating function to find $\\text{E}(X)$ and $\\text{Var}(X)$. $\\quad$ **[5]**\n\n**(ii)** The random variable $Y$ is defined by $Y = \\tfrac{1}{2}(X+4)$. By finding the probability distribution of $X$, or otherwise, show that $Y \\sim B(n,\\,p)$, stating the values of $n$ and $p$. $\\quad$ **[4]**",
              solution_image: ""
            }
          ],

          "Inference":            [],
          "Chi-squared Tests":    [],
          "Non-parametric Tests": []
        }
      },

    }
  }

};
