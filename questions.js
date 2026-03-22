const SYLLABUS = {

  "9709": {
    name: "Mathematics",
    code: "9709",
    sections: {

      "P1": {
        name: "Pure Mathematics 1",
        topics: {
          "Coordinate Geometry": [
            {
              id: "P1_CG_001",
              question_text: "A circle with centre $C$ has equation $x^2 + y^2 - 8x - 2y - 3 = 0$.\n\n**(i)** Find the coordinates of $C$ and the radius of the circle. $\\quad$ **[3]**\n\n**(ii)** Find the values of $k$ for which the line $y = k$ is a tangent to the circle, giving your answers in simplified surd form. $\\quad$ **[3]**\n\n**(iii)** The points $S$ and $T$ lie on the circumference of the circle. $M$ is the mid-point of the chord $ST$. Given that the length of $CM$ is $2$, calculate the length of the chord $ST$. $\\quad$ **[3]**\n\n**(iv)** Find the coordinates of the point where the circle meets the line $x - 2y - 12 = 0$. $\\quad$ **[6]**",
              solution_image: ""
            },
            {
              id: "P1_CG_002",
              question_text: "A circle with centre $C$ has equation $x^2 + y^2 - 10x + 4y + 4 = 0$.\n\n**(i)** Find the coordinates of $C$ and the radius of the circle. $\\quad$ **[3]**\n\n**(ii)** Show that the tangent to the circle at the point $P(8, 2)$ has equation $3x + 4y = 32$. $\\quad$ **[5]**\n\n**(iii)** The circle meets the $y$-axis at $Q$ and the tangent meets the $y$-axis at $R$. Find the area of triangle $PQR$. $\\quad$ **[4]**",
              solution_image: ""
            },
            {
              id: "P1_CG_003",
              question_text: "A curve has a maximum point at $(8, 12)$ and a minimum point at $(8, 0)$. The curve is the result of applying two transformations to a circle. The first transformation is a translation by the vector $\\begin{pmatrix}7\\\\-3\\end{pmatrix}$. The second transformation is a stretch in the $y$-direction.\n\n**(a)** State the scale factor of the stretch. $\\quad$ **[1]**\n\n**(b)** State the radius of the original circle. $\\quad$ **[1]**\n\n**(c)** State the coordinates of the centre of the circle after the translation has been completed but before the stretch is applied. $\\quad$ **[2]**\n\n**(d)** State the coordinates of the centre of the original circle. $\\quad$ **[2]**",
              solution_image: ""
            },
            {
              id: "P1_CG_004",
              question_text: "A circle with equation $x^2 + y^2 - 6x + 2y - 15 = 0$ meets the $y$-axis at the points $A$ and $B$. The tangents to the circle at $A$ and $B$ meet at the point $P$.\n\nFind the coordinates of $P$. $\\quad$ **[8]**",
              solution_image: ""
            },
            {
              id: "P1_CG_005",
              question_text: "Points $A$ and $B$ have coordinates $(4, 3)$ and $(8, -3)$ respectively. A circle with radius $10$ passes through both $A$ and $B$.\n\nFind the two possible equations of the circle. $\\quad$ **[6]**",
              solution_image: ""
            }
          ],
          "Trigonometry": [
            {
              id: "P1_TR_001",
              question_text: "Find the exact solution of the equation\n$$\\cos\\tfrac{1}{4}\\pi + \\tan 3x + \\frac{\\sqrt{2}}{2} = 0 \\quad \\text{for} \\quad -\\tfrac{1}{3}\\pi < x < \\tfrac{1}{3}\\pi$$\n$\\quad$ **[3]**",
              solution_image: ""
            },
            {
              id: "P1_TR_002",
              question_text: "**(ii)(a)** Show that the equation $\\sin\\theta\\tan\\theta = 3\\cos\\theta + 2$ can be written in the form\n$$4\\cos^2\\theta + 2\\cos\\theta - 1 = 0$$\n$\\quad$ **(3)**\n\n**(b)** Hence solve, for $0 \\leq \\theta < 360°$,\n$$\\sin\\theta\\tan\\theta = 3\\cos\\theta + 2$$\nshowing each stage of your working. $\\quad$ **(5)**",
              solution_image: ""
            },
            {
              id: "P1_TR_003",
              question_text: "**(a)** Show that the equation $\\tan 2x = 5\\sin 2x$ can be written in the form\n$$(1 - 5\\cos 2x)\\sin 2x = 0$$\n$\\quad$ **(2)**\n\n**(b)** Hence solve, for $0 \\leq x \\leq 180°$,\n$$\\tan 2x = 5\\sin 2x$$\ngiving your answers to 1 decimal place where appropriate. $\\quad$ **(5)**",
              solution_image: ""
            }
            {
              id: "P1_TR_004",
              question_text: "The diagram shows part of the graph of $y = \\sin(a(x+b))$, where $a$ and $b$ are positive constants.\n\n**(a)** State the value of $a$ and one possible value of $b$. $\\quad$ **[2]**\n\nAnother curve, with equation $y = f(x)$, has a single stationary point at the point $(p, q)$, where $p$ and $q$ are constants. This curve is transformed to a curve with equation $y = -2f\\!\\left(\\tfrac{1}{2}(x+8)\\right)$.\n\n**(b)** For the transformed curve, find the coordinates of the stationary point, giving your answer in terms of $p$ and $q$. $\\quad$ **[3]**",
              diagram_image: "P1_TR_004_d.svg",
              solution_image: ""
            }
          ],
            {
              id: "P1_BE_002",
              question_text: "Given that $(1 + ax)^n = 1 - 12x + 63x^2 + \\ldots$, find $a$ and $n$.",
              solution_image: ""
            },
            {
              id: "P1_BE_003",
              question_text: "In the expansion of $(2 + 3x)^n$, the coefficients of $x^4$ and $x^5$ are in the ratio $8:15$.\n\nFind the value of $n$.",
              solution_image: ""
            },
            {
              id: "P1_BE_004",
              question_text: "The first three terms, in descending powers of $x$, in the expansion of $\\left(2x^2 - \\dfrac{1}{4x}\\right)^n$ can be written in the form $256x^{16} + ax^{13} + bx^c$, where $n$, $a$, $b$ and $c$ are integers.\n\nFind the values of $n$, $a$, $b$ and $c$. $\\quad$ **[6]**",
              solution_image: ""
            }
          ],
          "Differentiation": [
            {
              id: "P1_DF_001",
              question_text: "The curve $y = 4x^2 + \\dfrac{a}{x} + 5$ has a stationary point. Find the value of the positive constant $a$ given that the $y$-coordinate of the stationary point is $32$. $\\quad$ **[8]**",
              solution_image: ""
            },
            {
              id: "P1_DF_002",
              question_text: "The curve $y = (1-x)(x^2 + 4x + k)$ has a stationary point when $x = -3$.\n\n**(i)** Find the value of the constant $k$. $\\quad$ **[7]**\n\n**(ii)** Determine whether the stationary point is a maximum or minimum point. $\\quad$ **[2]**\n\n**(iii)** Given that $y = 9x - 9$ is the equation of the tangent to the curve at the point $A$, find the coordinates of $A$. $\\quad$ **[5]**",
              solution_image: ""
            },
            {
              id: "P1_DF_003",
              question_text: "The volume $V$ of a sphere is increasing at the constant rate of $2\\pi$ cm$^3$s$^{-1}$.\n\nFind the rate of change of the surface area $S$ of the sphere when the volume is $36\\pi$ cm$^3$. $\\quad$ **[6]**",
              solution_image: ""
            },
            {
              id: "P1_DF_004",
              question_text: "The equation of a curve is $y = px^{\\frac{2}{3}} - 6x^2 + 1$, where $p$ is a constant.\n\n**(a)** Find $\\dfrac{dy}{dx}$ and $\\dfrac{d^2y}{dx^2}$ in terms of $p$. $\\quad$ **[2]**\n\n**(b)** It is given that $p = 3$. Find the coordinates of the stationary point and determine its nature. $\\quad$ **[4]**",
              solution_image: ""
            }
          ],
          "Quadratics": [
            {
              id: "P1_QD_001",
              question_text: "Solve the quadratic equation\n$$(\\sqrt{3}-1)x^2 - 2\\sqrt{3}\\,x = 3 + 3\\sqrt{3}$$\ngiving one root in the form $p + q\\sqrt{3}$ and the other in the form $r\\sqrt{3}$, where $p$, $q$ and $r$ are integers.",
              solution_image: ""
            },
            {
              id: "P1_QD_002",
              question_text: "A curve $C$ has equation\n$$(x-1)y^2 - 2xy + x = 0, \\quad x \\geq 0$$\n\nBy completing the square in the above equation, express $y$ in terms of $x$.",
              solution_image: ""
            },
            {
              id: "P1_QD_003",
              question_text: "A quadratic curve has equation $f(x) = (x-1)(x-a)$, where $a$ is a constant.\n\nShow, **without** a calculus method, that the coordinates of the minimum point of the curve are\n$$\\left(\\frac{a+1}{2},\\,-\\frac{(a-1)^2}{4}\\right)$$",
              solution_image: ""
            },
            {
              id: "P1_QD_004",
              question_text: "The equation $(k+5)x^2 + 4x + (k+2) = 0$, where $k$ is a constant, has two distinct real solutions for $x$.\n\nFind the set of possible values for $k$.",
              solution_image: ""
            }
          ],

          "Integration": [
            {
              id: "P1_IN_001",
              question_text: "The point $A$ with $x$-coordinate $2$ lies on the curve $y = \\sqrt{4x+1}$. The tangent to the curve at $A$ meets the $x$-axis at a point.\n\nFind the exact area of the region enclosed by the curve, the tangent and the $x$-axis. $\\quad$ **[10]**",
              solution_image: ""
            },
            {
              id: "P1_IN_002",
              question_text: "A curve passes through the point $(1, 8)$ and has an equation which satisfies\n$$\\frac{dy}{dx} = 2x + \\frac{a}{x^3} + 3$$\nfor all non-zero values of $x$. The area enclosed by the curve, the $x$-axis, the line $x = 1$ and the line $x = 3$ is $30$ square units.\n\nFind the value of the positive constant $a$. $\\quad$ **[9]**",
              solution_image: ""
            },
            {
              id: "P1_IN_003",
              question_text: "A curve has an equation which satisfies $\\dfrac{d^2y}{dx^2} = 3x^{-\\frac{1}{2}}$ for all positive values of $x$. The point $P(4, 1)$ lies on the curve, and the gradient of the curve at $P$ is $5$.\n\nFind the equation of the curve. $\\quad$ **[7]**",
              solution_image: ""
            },
            {
              id: "P1_IN_004",
              question_text: "The curve $y = 6x^{\\frac{3}{2}}$ and the curve $y = \\dfrac{8}{x^2} - 2$ intersect at the point $(1, 6)$.\n\nUse integration to find the area of the region enclosed by the two curves and the $x$-axis. $\\quad$ **[8]**",
              solution_image: ""
            },
            {
              id: "P1_IN_005",
              question_text: "The curve $y = x^2 - 3x$ crosses the $x$-axis at $x = 0$ and $x = 3$.\n\n**(i)** Explain why $\\displaystyle\\int_0^5 (x^2 - 3x)\\,dx$ does not give the total area of the regions between the curve and the $x$-axis for $0 \\leq x \\leq 5$. $\\quad$ **[1]**\n\n**(ii)** Use integration to find the exact total area of the regions between the curve and the $x$-axis for $0 \\leq x \\leq 5$. $\\quad$ **[7]**",
              solution_image: ""
            },
            {
              id: "P1_IN_006",
              question_text: "The curve $y = 1 - 3x^{-\\frac{1}{2}}$ intersects the $x$-axis at $(9, 0)$.\n\n**(i)** Verify that the curve intersects the $x$-axis at $(9, 0)$. $\\quad$ **[1]**\n\n**(ii)** The region enclosed by the curve, the $x$-axis and the line $x = a$ where $a > 9$ has area $4$ square units. Find the value of $a$. $\\quad$ **[9]**",
              solution_image: ""
            },
            {
              id: "P1_IN_007",
              question_text: "The curve $y = x^{\\frac{3}{2}} - 1$ crosses the $x$-axis at $(1, 0)$. The tangent to the curve at the point $(4, 7)$ meets the $x$-axis at a point.\n\n**(i)** Show that $\\displaystyle\\int_1^4 \\left(x^{\\frac{3}{2}} - 1\\right)dx = 9\\tfrac{2}{5}$. $\\quad$ **[4]**\n\n**(ii)** Hence find the exact area of the region enclosed by the curve, the tangent and the $x$-axis. $\\quad$ **[5]**",
              solution_image: ""
            },
            {
              id: "P1_IN_008",
              question_text: "The curve $y = 10 + 8x + x^2 - x^3$ has a maximum turning point at $A$.\n\n**(a)** Using calculus, show that the $x$-coordinate of $A$ is $2$. $\\quad$ **(3)**\n\nThe region $R$ is bounded by the curve, the $y$-axis and the straight line from the origin $O$ to $A$.\n\n**(b)** Using calculus, find the exact area of $R$. $\\quad$ **(8)**",
              solution_image: ""
            }
          ],

          "Sequences & Series": [
            {
              id: "P1_SS_001",
              question_text: "An arithmetic progression has common difference $d$. The 3rd term of this progression is $10$.\n\n**(a)** Write down expressions for the 1st term and the 2nd term of this progression. Give your answers in terms of $d$ only. $\\quad$ **[2]**\n\n**(b)** When each of the first 3 terms is squared, the sum of these squares is $140$. There are two possible values for $d$.\n\nUsing your answer to part **(a)**, find the sum of the first 200 terms of the progression with the smaller value of $d$. $\\quad$ **[7]**",
              solution_image: ""
            },
            {
              id: "P1_SS_002",
              question_text: "The first term of a convergent geometric progression is $10$. The sum of the first $4$ terms is $p$ and the sum of the first $8$ terms is $q$. It is given that $\\dfrac{q}{p} = \\dfrac{17}{16}$.\n\nFind the two possible values of the sum to infinity. $\\quad$ **[5]**",
              solution_image: ""
            },
            {
              id: "P1_SS_003",
              question_text: "The first three terms of an arithmetic progression are $-3\\tan\\dfrac{\\theta}{2}$, $-\\tan\\dfrac{\\theta}{2}$, $\\tan\\dfrac{\\theta}{2}$, where $0 < \\theta < \\dfrac{\\pi}{2}$.\n\n**(i)** Given that the 12th term of this progression is equal to $\\dfrac{19\\sqrt{3}}{3}$, find the exact value of $\\theta$. $\\quad$ **[4]**",
              solution_image: ""
            },
            {
              id: "P1_SS_004",
              question_text: "The first term of a geometric progression and the first term of an arithmetic progression are both equal to $a$. The third term of the geometric progression is equal to the second term of the arithmetic progression. The fifth term of the geometric progression is equal to the sixth term of the arithmetic progression.\n\nGiven that all terms are positive and not all equal, find the sum of the first twenty terms of the arithmetic progression in terms of $a$. $\\quad$ **[6]**",
              solution_image: ""
            }
          ],

          "Functions": [
            {
              id: "P1_FN_001",
              question_text: "The function f is defined, for all real $x$, by $f(x) = 13 - 4x - 2x^2$.\n\n**(a) (i)** Write $f(x)$ in the form $a + b(x+c)^2$, where $a$, $b$ and $c$ are constants. $\\quad$ **[3]**\n\n$\\quad$ **(ii)** Hence write down the range of f. $\\quad$ **[1]**\n\n**(b)** The function g is defined, for $x \\geq 1$, by $g(x) = \\sqrt{x^2 + 2x - 1}$.\n\n$\\quad$ **(i)** Given that $g^{-1}(x)$ exists, write down the domain and range of $g^{-1}$. $\\quad$ **[2]**\n\n$\\quad$ **(ii)** Show that $g^{-1}(x) = -1 + \\sqrt{px^2 + q}$, where $p$ and $q$ are integers. $\\quad$ **[4]**",
              solution_image: ""
            },
            {
              id: "P1_FN_002",
              question_text: "The function f is defined by $f(x) = \\dfrac{1}{2x-5}$ for $x > 2.5$.\n\n**(i)** Find an expression for $f^{-1}(x)$. $\\quad$ **[2]**\n\n**(ii)** State the domain of $f^{-1}(x)$. $\\quad$ **[1]**\n\n**(iii)** Find an expression for $f^2(x)$, giving your answer in the form $\\dfrac{ax+b}{cx+d}$, where $a$, $b$, $c$ and $d$ are integers to be found. $\\quad$ **[3]**",
              solution_image: ""
            },
            {
              id: "P1_FN_003",
              question_text: "**(a)** Express $4x^2 - 12x + 13$ in the form $(2x + a)^2 + b$, where $a$ and $b$ are constants. $\\quad$ **[3]**\n\nThe function f is defined by $f(x) = 4x^2 - 12x + 13$ for $p < x < q$, where $p$ and $q$ are constants. The function g is defined by $g(x) = 3x + 1$ for $x < 8$.\n\n**(b)** Given that it is possible to form the composite function gf, find the least possible value of $p$ and the greatest possible value of $q$.",
              solution_image: ""
            },
            {
              id: "P1_FN_004",
              question_text: "Functions f and g are defined for all real values of $x$ by\n$$f(x) = 4x^2 - c \\quad \\text{and} \\quad g(x) = 2x + k$$\nwhere $c$ and $k$ are positive constants. It is given that $g^{-1}(3k+1) = c$.\n\n**(a)** Show that $g(f(x)) = 8x^2 - k - 1$. $\\quad$ **[3]**\n\n**(b)** The curve $y = 8x^2 - k - 1$ is transformed to the curve $y = h(x)$ by the following sequence of transformations:\n\n- Translation by the vector $\\begin{pmatrix}2\\\\3\\end{pmatrix}$\n- Stretch in the $y$-direction by scale factor $k$\n- Reflection in the $x$-axis\n\nFind an expression for $h(x)$ in terms of $x$ and $k$. $\\quad$ **[3]**\n\n**(c)** The range of $h$ is given by $h(x) \\leq 15$. Find the values of $c$ and $k$. $\\quad$ **[3]**",
              solution_image: ""
            }
          ],
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
          "Integration": [
            {
              id: "P3_IN_001",
              question_text: "**(i)** State the derivative of $e^{\\cos x}$. $\\quad$ **[1]**\n\n**(ii)** Hence use integration by parts to find the exact value of\n$$\\int_0^{\\frac{1}{2}\\pi} \\cos x \\sin x \\, e^{\\cos x} \\, dx$$\n$\\quad$ **[6]**",
              solution_image: ""
            },
            {
              id: "P3_IN_002",
              question_text: "Find the exact value of\n$$\\int_1^{8} \\frac{1}{\\sqrt[3]{x}} \\ln x \\, dx$$\ngiving your answer in the form $A\\ln 2 + B$, where $A$ and $B$ are constants to be found. $\\quad$ **[5]**",
              solution_image: ""
            },
            {
              id: "P3_IN_003",
              question_text: "Use the substitution $u = 1 + \\ln x + x$ to find\n$$\\int \\frac{3(x+1)(1-\\ln x - x)}{x(1+\\ln x+x)} \\, dx$$",
              solution_image: ""
            },
            {
              id: "P3_IN_004",
              question_text: "Use the substitution $u = 2 + \\ln t$ to find the exact value of\n$$\\int_1^{e} \\frac{1}{t(2+\\ln t)^2} \\, dt$$\n$\\quad$ **[6]**",
              solution_image: ""
            },
            {
              id: "P3_IN_005",
              question_text: "**(i)** Show that the substitution $x = \\sin^2\\theta$ transforms\n$$\\int \\sqrt{\\frac{x}{1-x}} \\, dx \\quad \\text{to} \\quad \\int 2\\sin^2\\theta \\, d\\theta$$\n$\\quad$ **[4]**\n\n**(ii)** Hence find\n$$\\int_0^{1} \\sqrt{\\frac{x}{1-x}} \\, dx$$\n$\\quad$ **[5]**",
              solution_image: ""
            },
            {
              id: "P3_IN_006",
              question_text: "**(i)** Use the quotient rule to show that the derivative of $\\dfrac{\\cos x}{\\sin x}$ is $\\dfrac{-1}{\\sin^2 x}$. $\\quad$ **[2]**\n\n**(ii)** Show that\n$$\\int_{\\frac{1}{6}\\pi}^{\\frac{1}{4}\\pi} \\frac{\\sqrt{1+\\cos 2x}}{\\sin x \\sin 2x} \\, dx = \\frac{1}{2}(\\sqrt{6}-\\sqrt{2})$$",
              solution_image: ""
            }
          ],
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
          "Rational Functions": [
            {
              id: "FP1_RF_001",
              question_text: "A curve $C$ has equation\n$$h(x) = \\frac{f(x)}{g(x)}, \\quad x \\in \\mathbb{R}, \\quad g(x) \\neq 0$$\nwhere $f(x)$ is a quadratic function and $g(x)$ a linear function.\n\nThe asymptotes of $C$ have equations $x = -1$ and $y = x + 2$, and its graph passes through the point $P(1, 5)$.\n\n**a)** Determine a simplified Cartesian equation for $C$.\n\n**b)** Use a discriminant method to find the range of $h(x)$ and hence calculate the coordinates of the stationary points of $C$.\n\n**c)** Sketch in separate diagrams, showing all relevant details including asymptotic behaviour, the graph of:\n\n- **i.** $y = h(x)$\n- **ii.** $y^2 = h(x)$\n- **iii.** $y = h(|x|)$",
              solution_image: ""
            }
          ],
          "Series": [
            {
              id: "FP1_SR_001",
              question_text: "**a** Prove by induction that for all positive integers $n$:\n$$\\sum_{r=1}^{2n} r^2 = \\frac{1}{3}n(2n+1)(4n+1)$$\n\n**b** Given that $\\displaystyle\\sum_{r=1}^{2n} r^2 = k\\sum_{r=1}^{n} r^2$, show that $k$ must satisfy\n$$n = \\frac{2-k}{k-8}$$",
              solution_image: ""
            }
          ],

          "Roots of Polynomials": [
            {
              id: "FP1_RP_001",
              question_text: "The quartic equation $3072x^4 - 2880x^3 + 840x^2 - 90x + 3 = 0$ has roots $\\alpha$, $r\\alpha$, $r^2\\alpha$ and $r^3\\alpha$ for some real constant $r$.\n\nSolve the equation. $\\quad$ **[7]**",
              solution_image: "FP1_RP_001_s.png"
            },
            {
              id: "FP1_RP_002",
              question_text: "The equation $x^4 - 6x^3 - 73x^2 + kx + m = 0$ has two positive roots $\\alpha$, $\\beta$ and two negative roots $\\gamma$, $\\delta$. It is given that $\\alpha\\beta = \\gamma\\delta = 4$.\n\n**(i)** Find the values of the constants $k$ and $m$. $\\quad$ **[5]**\n\n**(ii)** Show that $(\\alpha+\\beta)(\\gamma+\\delta) = -81$. $\\quad$ **[4]**\n\n**(iii)** Find the quadratic equation which has roots $\\alpha+\\beta$ and $\\gamma+\\delta$. $\\quad$ **[2]**\n\n**(iv)** Find $\\alpha+\\beta$ and $\\gamma+\\delta$. $\\quad$ **[3]**\n\n**(v)** Show that $\\alpha^2 - 3(1+\\sqrt{10})\\alpha + 4 = 0$, and find similar quadratic equations satisfied by $\\beta$, $\\gamma$ and $\\delta$. $\\quad$ **[6]**",
              solution_image: ""
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
            },
            {
              id: "FP1_VL_002",
              question_text: "The equation of the plane $\\Pi$ is $2x + 3y + 4z = 48$.\n\nObtain a vector equation of $\\Pi$ in the form $\\mathbf{r} = \\mathbf{a} + \\lambda\\mathbf{b} + \\mu\\mathbf{c}$, where $\\mathbf{a}$, $\\mathbf{b}$ and $\\mathbf{c}$ are of the form $p\\mathbf{i}$, $q\\mathbf{i}+r\\mathbf{j}$ and $s\\mathbf{i}+t\\mathbf{k}$ respectively, and where $p$, $q$, $r$, $s$, $t$ are integers. $\\quad$ **[6]**\n\nThe line $l$ has vector equation $\\mathbf{r} = 29\\mathbf{i} - 2\\mathbf{j} - \\mathbf{k} + \\theta(5\\mathbf{i} - 6\\mathbf{j} + 2\\mathbf{k})$. Show that $l$ lies in $\\Pi$. $\\quad$ **[3]**\n\nFind, in the form $ax + by + cz = d$, the equation of the plane which contains $l$ and is perpendicular to $\\Pi$. $\\quad$ **[4]**",
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
            },
            {
              id: "FP1_PI_012",
              question_text: "The sequence of real numbers $a_1, a_2, a_3, \\ldots$ is such that $a_1 = 1$ and\n$$a_{n+1} = \\left(a_n + \\frac{1}{a_n}\\right)^3$$\n\n**(a)** Prove by mathematical induction that $\\ln a_n \\geq 3^{n-1} \\ln 2$ for all integers $n \\geq 2$.\n\n$\\quad$ [You may use the fact that $\\ln\\!\\left(x + \\dfrac{1}{x}\\right) > \\ln x$ for $x > 0$.]",
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
