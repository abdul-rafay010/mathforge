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
              question_text: "The point $A$ with $x$-coordinate $2$ lies on the curve $y = \\sqrt{4x+1}$. The tangent to the curve at $A$ meets the $x$-axis at a point.\n\nFind the area of the shaded region enclosed by the curve, the tangent and the $x$-axis. $\\quad$ **[10]**",
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

          "Polar Coordinates": [
            {
              id: "FP1_PC_001",
              question_text: "The polar equation of $C_1$ is $r = \\sqrt{2}\\cos\\theta$ and the polar equation of $C_2$ is $r = \\sqrt{2\\sin 2\\theta}$. Both curves are defined for $0 \\leq \\theta \\leq \\frac{1}{2}\\pi$. The curves intersect at the pole $O$ and at the point $P$. The value of $\\theta$ at $P$ is $\\alpha$.\n\n**(i)** Show that $\\tan\\alpha = \\dfrac{1}{2}$. $\\quad$ **[2]**\n\n**(ii)** Show that the area of the region common to $C_1$ and $C_2$ is $\\dfrac{1}{4}\\pi - \\dfrac{1}{2}\\alpha$. $\\quad$ **[7]**",
              solution_image: ""
            },
            {
              id: "FP1_PC_002",
              question_text: "The equation of a curve, in polar coordinates, is\n$$r = \\sec\\theta + \\tan\\theta, \\quad 0 \\leq \\theta \\leq \\tfrac{1}{3}\\pi$$\n\n**(i)** Sketch the curve. $\\quad$ **[2]**\n\n**(ii)** Find the exact area of the region bounded by the curve and the lines $\\theta = 0$ and $\\theta = \\frac{1}{3}\\pi$. $\\quad$ **[6]**\n\n**(iii)** Find a Cartesian equation of the curve. $\\quad$ **[3]**",
              solution_image: ""
            },
            {
              id: "FP1_PC_003",
              question_text: "A curve has polar equation\n$$r = 6 + a\\sin\\theta, \\quad 0 < a < 6, \\quad 0 \\leq \\theta < 2\\pi$$\n\nThe area enclosed by the curve is $\\dfrac{97\\pi}{2}$.\n\nFind the value of the constant $a$. $\\quad$ **(8)**",
              solution_image: ""
            },
            {
              id: "FP1_PC_004",
              question_text: "The equation of a curve is $x^2 + y^2 - x = \\sqrt{x^2 + y^2}$.\n\n**(i)** Find the polar equation of this curve in the form $r = f(\\theta)$. $\\quad$ **[3]**\n\n**(ii)** Sketch the curve. $\\quad$ **[2]**\n\n**(iii)** The line $x + 2y = 2$ divides the region enclosed by the curve into two parts. Find the ratio of the two areas. $\\quad$ **[6]**",
              solution_image: ""
            },
            {
              id: "FP1_PC_005",
              question_text: "The curve $y = \\sqrt{2x+1}$ passes through the points $A\\!\\left(-\\tfrac{1}{2},\\,0\\right)$ and $B(4,\\,3)$.\n\n**(i)** Find the area of the region bounded by the curve, the $x$-axis and the line $x = 4$. Hence find the area of the region bounded by the curve and the lines $OA$ and $OB$, where $O$ is the origin. $\\quad$ **[4]**\n\n**(ii)** Show that the curve between $B$ and $A$ can be expressed in polar coordinates as\n$$r = \\frac{1}{1-\\cos\\theta}, \\quad \\tan^{-1}\\!\\left(\\tfrac{3}{4}\\right) \\leq \\theta \\leq \\pi$$\n$\\quad$ **[5]**\n\n**(iii)** Deduce from parts **(i)** and **(ii)** that\n$$\\int_{\\tan^{-1}(\\frac{3}{4})}^{\\pi} \\operatorname{cosec}^4\\!\\left(\\tfrac{1}{2}\\theta\\right)\\,d\\theta = 24$$\n$\\quad$ **[4]**",
              solution_image: ""
            },
            {
              id: "FP1_PC_006",
              question_text: "The curve $C_1$ has polar equation $r = a(\\cos\\theta + \\sin\\theta)$ for $-\\frac{1}{4}\\pi \\leq \\theta \\leq \\frac{3}{4}\\pi$, where $a$ is a positive constant.\n\n**(a)** Find a Cartesian equation for $C_1$ and show that it represents a circle, stating its radius and the Cartesian coordinates of its centre. $\\quad$ **[4]**\n\nThe curve $C_2$ has polar equation $r = a\\theta$ and intersects $C_1$ at the pole and at the point with polar coordinates $(a\\phi,\\,\\phi)$.\n\n**(c)** Verify that $1.25 < \\phi < 1.26$. $\\quad$ **[2]**\n\n**(d)** Show that the area of the smaller region enclosed by $C_1$ and $C_2$ is equal to\n$$\\tfrac{1}{2}a^2\\!\\left(\\tfrac{1}{3}\\pi + \\tfrac{1}{3}\\phi^3 - \\phi + \\tfrac{1}{2}\\cos 2\\phi\\right)$$\nand deduce, in terms of $a$ and $\\phi$, the area of the larger region enclosed by $C_1$ and $C_2$. $\\quad$ **[7]**",
              solution_image: "FP1_PC_006_s.png"
            }
          ],

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
              id: "FP1_PI_006",
              question_text: "**(i)** Show that\n$$\\frac{d^{n+1}}{dx^{n+1}}\\left(x^{n+1}\\ln x\\right) = \\frac{d^n}{dx^n}\\left(x^n + (n+1)x^n \\ln x\\right)$$\n$\\quad$ **[2]**\n\n**(ii)** Prove by mathematical induction that, for all positive integers $n$,\n$$\\frac{d^n}{dx^n}\\left(x^n \\ln x\\right) = n!\\left(\\ln x + 1 + \\frac{1}{2} + \\ldots + \\frac{1}{n}\\right)$$\n$\\quad$ **[5]**",
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

          "Matrices": [
            {
              id: "FP1_MA_001",
              question_text: "The matrix $\\begin{pmatrix} 4 & 2 \\\\ 6 & k \\end{pmatrix}$, where $k$ is a constant, defines a transformation in the $(x,y)$-plane.\n\n**(i)** Find the set of invariant points of the transformation\n\n$\\quad$ **(A)** when $k = 4$,\n\n$\\quad$ **(B)** when $k = 5$. $\\quad$ **[5]**\n\n**(ii)** When $k = 5$, verify that $y = 2x - 3$ is an invariant line of the transformation. $\\quad$ **[4]**",
              solution_image: ""
            },
            {
              id: "FP1_MA_002",
              question_text: "You are given that\n$$\\mathbf{A} = \\begin{pmatrix} \\lambda & 6 & -4 \\\\ 2 & 5 & -1 \\\\ -1 & 4 & 3 \\end{pmatrix}, \\quad \\mathbf{B} = \\begin{pmatrix} -19 & 34 & -14 \\\\ 5 & -5 & 5 \\\\ -13 & 18 & -3 \\end{pmatrix}$$\nand $\\mathbf{AB} = \\mu\\mathbf{I}$, where $\\mathbf{I}$ is the $3 \\times 3$ identity matrix.\n\n**(i)** Find the values of $\\lambda$ and $\\mu$. $\\quad$ **[4]**\n\n**(ii)** Hence find $\\mathbf{B}^{-1}$. $\\quad$ **[2]**",
              solution_image: ""
            },
            {
              id: "FP1_MA_003",
              question_text: "The transformation $P$ is an enlargement, centre the origin, with scale factor $k$, where $k > 0$.\n\nThe transformation $Q$ is a rotation through angle $\\theta$ degrees anticlockwise about the origin.\n\n$P$ followed by $Q$ is represented by the matrix\n$$\\mathbf{M} = \\begin{pmatrix} -4 & -4\\sqrt{3} \\\\ 4\\sqrt{3} & -4 \\end{pmatrix}$$\n\n**(a)** Determine\n\n$\\quad$ **(i)** the value of $k$,\n\n$\\quad$ **(ii)** the smallest value of $\\theta$. $\\quad$ **(4)**\n\n**(b)** A square $S$ has vertices at $(0,0)$, $(a,-a)$, $(2a,0)$ and $(a,a)$ where $a$ is a constant. The square $S$ is transformed to $S'$ by $\\mathbf{M}$.\n\nDetermine, in terms of $a$, the area of $S'$. $\\quad$ **(2)**",
              solution_image: ""
            },
            {
              id: "FP1_MA_004",
              question_text: "**(i)** In each of the following cases, find a $2 \\times 2$ matrix that represents\n\n$\\quad$ **(a)** a reflection in the line $y = -x$,\n\n$\\quad$ **(b)** a rotation of $135°$ anticlockwise about $(0,0)$,\n\n$\\quad$ **(c)** a reflection in $y = -x$ followed by a rotation of $135°$ anticlockwise about $(0,0)$. $\\quad$ **(4)**\n\n**(ii)** The triangle $T$ has vertices at $(1,k)$, $(3,0)$ and $(11,0)$, where $k$ is a constant. Triangle $T$ is transformed onto triangle $T'$ by the matrix\n$$\\begin{pmatrix} 6 & -2 \\\\ 1 & 2 \\end{pmatrix}$$\nGiven that the area of triangle $T'$ is $364$ square units, find the value of $k$. $\\quad$ **(6)**",
              solution_image: ""
            },
            {
              id: "FP1_MA_005",
              question_text: "**(a) (i)** By writing $\\cos\\left(\\frac{1}{12}\\pi\\right)$ as $\\cos\\left(\\frac{1}{4}\\pi - \\frac{1}{6}\\pi\\right)$, show that $\\cos\\left(\\frac{1}{12}\\pi\\right) = \\frac{1}{4}(\\sqrt{6}+\\sqrt{2})$. $\\quad$ **[1]**\n\n$\\quad$ **(ii)** Show also that $\\sin\\left(\\frac{1}{12}\\pi\\right) = \\frac{1}{4}(\\sqrt{6}-\\sqrt{2})$. $\\quad$ **[1]**\n\nThe matrix $\\mathbf{M}$ is such that\n$$\\mathbf{M} = \\frac{1}{4}\\begin{pmatrix} \\sqrt{6}+\\sqrt{2} & \\sqrt{2}-\\sqrt{6} \\\\ \\sqrt{6}-\\sqrt{2} & \\sqrt{6}+\\sqrt{2} \\end{pmatrix} \\begin{pmatrix} 1 & 0 \\\\ 0 & -1 \\end{pmatrix}$$\n\n**(b)** The matrix $\\mathbf{M}$ represents a sequence of two geometrical transformations in the $x$-$y$ plane. Give full details of each transformation, and make clear the order in which they are applied. $\\quad$ **[4]**\n\n**(c)** Write $\\mathbf{M}^{-1}$ as the product of two matrices, neither of which is $\\mathbf{I}$. $\\quad$ **[2]**\n\n**(d)** Given that $y = mx$ is an invariant line of the transformation represented by $\\mathbf{M}$, show that\n$$m^2\\sin\\!\\left(\\tfrac{1}{12}\\pi\\right) + 2m\\cos\\!\\left(\\tfrac{1}{12}\\pi\\right) - \\sin\\!\\left(\\tfrac{1}{12}\\pi\\right) = 0$$\nand find the values of $m$ in the form $a\\cot\\!\\left(\\tfrac{1}{12}\\pi\\right) + b\\,\\text{cosec}\\!\\left(\\tfrac{1}{12}\\pi\\right)$, where $a$ and $b$ are integers to be determined. $\\quad$ **[6]**",
              solution_image: ""
            }
          ]
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
