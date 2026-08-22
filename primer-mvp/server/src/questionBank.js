// Question Tree for "fractions" (Class 3-5), tiered by difficulty 1 (easiest) to 5 (hardest).
// Kept as plain data on purpose - the adaptive logic that walks this tree is deterministic
// (see adaptiveEngine.js). The LLM is only ever used for grading free-text explanations and
// for translation, never for choosing what to ask next.

const bank = {
  fractions: {
    1: [
      { id: 'f1-1', text: 'Which picture shows 1/2 shaded?', prompt: 'Pick the option where exactly half of the shape is shaded.', choices: ['1 out of 2 parts shaded', '1 out of 4 parts shaded', '3 out of 4 parts shaded'], answer: '1 out of 2 parts shaded', explanation: 'Half means 1 part out of 2 equal parts - like cutting a pizza into 2 slices and taking 1.' },
      { id: 'f1-2', text: 'What is 1/4 of a pizza?', prompt: 'A pizza is cut into 4 equal slices. How many slices is 1/4?', choices: ['1 slice', '2 slices', '4 slices'], answer: '1 slice', explanation: '1/4 means 1 out of 4 equal parts - so it is just 1 slice out of the 4.' },
      { id: 'f1-3', text: 'Which fraction is bigger: 1/2 or 1/4?', prompt: 'Think about pizza slices - is a half-pizza slice bigger or smaller than a quarter-pizza slice?', choices: ['1/2', '1/4', 'They are equal'], answer: '1/2', explanation: 'When the top number is the same, fewer equal parts means each part is bigger - so 1/2 > 1/4.' },
      { id: 'f1-4', text: 'How many quarters make a whole?', prompt: 'If 1/4 is one slice of a 4-slice pizza, how many slices make the whole pizza?', choices: ['2', '4', '8'], answer: '4', explanation: '4 quarters (4/4) always make one whole, just like 4 slices make the whole pizza.' },
      { id: 'f1-5', text: 'A chocolate bar has 3 out of 6 pieces eaten. What fraction is eaten?', prompt: 'Count the eaten pieces over the total pieces.', choices: ['3/6', '6/3', '3/3'], answer: '3/6', explanation: 'Fraction = pieces eaten over total pieces, so 3 out of 6 is written as 3/6.' },
      { id: 'f1-6', text: 'Which shows a fraction equal to a whole?', prompt: 'A whole means every part is included.', choices: ['4/4', '3/4', '1/4'], answer: '4/4', explanation: 'When the top and bottom numbers are the same, the fraction equals 1 whole.' }
    ],
    2: [
      { id: 'f2-1', text: '1/4 + 1/4 = ?', prompt: 'Add these two quarters together.', choices: ['1/2', '2/8', '1/4'], answer: '1/2', explanation: 'When denominators match, add the top numbers: 1+1=2, so 2/4, which simplifies to 1/2.' },
      { id: 'f2-2', text: '2/6 in its simplest form is?', prompt: 'Find a smaller fraction that means the same amount as 2/6.', choices: ['1/3', '1/2', '2/3'], answer: '1/3', explanation: 'Both 2 and 6 can be divided by 2: 2/6 becomes 1/3.' },
      { id: 'f2-3', text: '3/4 - 1/4 = ?', prompt: 'Subtract these two fractions with the same denominator.', choices: ['2/4', '1/2', 'Both are the same answer'], answer: 'Both are the same answer', explanation: '3-1=2, so 2/4 - and 2/4 simplifies to 1/2. Both answers describe the same amount!' },
      { id: 'f2-4', text: 'Which is equal to 2/4?', prompt: 'Find another fraction worth the same as 2/4.', choices: ['1/2', '1/4', '3/4'], answer: '1/2', explanation: '2/4 simplifies by dividing top and bottom by 2, giving 1/2.' },
      { id: 'f2-5', text: '2/5 + 2/5 = ?', prompt: 'Add the numerators since the denominators already match.', choices: ['4/5', '4/10', '2/5'], answer: '4/5', explanation: 'Same denominator, so add the tops: 2+2=4, giving 4/5.' },
      { id: 'f2-6', text: '5/6 - 2/6 = ?', prompt: 'Subtract the numerators, keep the denominator the same.', choices: ['3/6', '3/0', '7/6'], answer: '3/6', explanation: '5-2=3, so the answer is 3/6, which also simplifies to 1/2.' }
    ],
    3: [
      { id: 'f3-1', text: '1/2 + 1/4 = ?', prompt: 'These have different denominators - what do you need to do first?', choices: ['3/4', '2/6', '1/6'], answer: '3/4', explanation: 'Rewrite 1/2 as 2/4 so both fractions share a denominator, then add: 2/4 + 1/4 = 3/4.' },
      { id: 'f3-2', text: '2/3 + 1/6 = ?', prompt: 'Find a common denominator for 3 and 6 first.', choices: ['5/6', '3/9', '3/6'], answer: '5/6', explanation: '2/3 becomes 4/6, then 4/6 + 1/6 = 5/6.' },
      { id: 'f3-3', text: 'Which fraction is between 1/2 and 1?', prompt: 'Think of a fraction whose value sits between one-half and a whole.', choices: ['3/4', '1/4', '1/3'], answer: '3/4', explanation: '3/4 = 0.75, which sits between 1/2 (0.5) and 1 (1.0).' },
      { id: 'f3-4', text: '1 - 1/3 = ?', prompt: 'Rewrite 1 as a fraction with denominator 3 first.', choices: ['2/3', '1/3', '3/3'], answer: '2/3', explanation: '1 = 3/3, so 3/3 - 1/3 = 2/3.' },
      { id: 'f3-5', text: '1/3 + 1/6 = ?', prompt: 'Convert 1/3 into sixths so the denominators match.', choices: ['1/2', '2/9', '2/6'], answer: '1/2', explanation: '1/3 = 2/6, so 2/6 + 1/6 = 3/6, which simplifies to 1/2.' },
      { id: 'f3-6', text: '3/5 - 1/10 = ?', prompt: 'Convert 3/5 into tenths first.', choices: ['1/2', '2/5', '4/10'], answer: '1/2', explanation: '3/5 = 6/10, so 6/10 - 1/10 = 5/10, which simplifies to 1/2.' }
    ],
    4: [
      { id: 'f4-1', text: '3/4 x 2 = ?', prompt: 'Multiplying a fraction by a whole number - multiply the top only.', choices: ['3/2', '6/4', 'Both are correct'], answer: 'Both are correct', explanation: '3/4 x 2 = 6/4, which simplifies to 3/2 (or 1 1/2). Both forms are right!' },
      { id: 'f4-2', text: '5/8 - 1/4 = ?', prompt: 'Convert 1/4 into eighths first.', choices: ['3/8', '4/4', '1/2'], answer: '3/8', explanation: '1/4 = 2/8, so 5/8 - 2/8 = 3/8.' },
      { id: 'f4-3', text: 'A recipe needs 3/4 cup of sugar. You want to make half the recipe. How much sugar?', prompt: 'Half of 3/4 means dividing 3/4 by 2.', choices: ['3/8 cup', '1/2 cup', '3/2 cup'], answer: '3/8 cup', explanation: 'Half of 3/4 is 3/4 x 1/2 = 3/8.' },
      { id: 'f4-4', text: 'Order from smallest to largest: 1/3, 1/2, 2/5', prompt: 'Try converting all three to a common denominator like 30ths to compare fairly.', choices: ['1/3, 2/5, 1/2', '1/2, 2/5, 1/3', '2/5, 1/3, 1/2'], answer: '1/3, 2/5, 1/2', explanation: 'As 30ths: 1/3=10/30, 2/5=12/30, 1/2=15/30 - so the order is 1/3, 2/5, 1/2.' },
      { id: 'f4-5', text: '2/3 x 4 = ?', prompt: 'Multiply the numerator by 4, keep the denominator.', choices: ['8/3', '2/12', '6/3'], answer: '8/3', explanation: '2 x 4 = 8, so 2/3 x 4 = 8/3 (or 2 2/3).' },
      { id: 'f4-6', text: 'A ribbon is 7/8 m long. You cut off 1/2 m. How much is left?', prompt: 'Convert 1/2 into eighths before subtracting.', choices: ['3/8 m', '1/8 m', '5/8 m'], answer: '3/8 m', explanation: '1/2 = 4/8, so 7/8 - 4/8 = 3/8 m left.' }
    ],
    5: [
      { id: 'f5-1', text: '2/3 x 3/5 = ?', prompt: 'Multiply numerators together and denominators together, then simplify.', choices: ['6/15', '2/5', 'Both are correct'], answer: 'Both are correct', explanation: '2x3=6 and 3x5=15, giving 6/15, which simplifies to 2/5.' },
      { id: 'f5-2', text: '3/4 ÷ 1/2 = ?', prompt: 'Dividing by a fraction means multiplying by its reciprocal.', choices: ['3/2', '3/8', '1/2'], answer: '3/2', explanation: 'Flip 1/2 to 2/1, then 3/4 x 2/1 = 6/4 = 3/2.' },
      { id: 'f5-3', text: 'A tank is 2/5 full. You add 1/4 more of the tank. How full is it now?', prompt: 'Add 2/5 and 1/4 using a common denominator of 20.', choices: ['13/20', '3/9', '1/2'], answer: '13/20', explanation: '2/5 = 8/20 and 1/4 = 5/20, so 8/20 + 5/20 = 13/20.' },
      { id: 'f5-4', text: 'Which is larger: 5/6 or 7/9?', prompt: 'Convert both to a common denominator like 18ths.', choices: ['5/6', '7/9', 'They are equal'], answer: '5/6', explanation: 'As 18ths: 5/6=15/18 and 7/9=14/18, so 5/6 is slightly larger.' },
      { id: 'f5-5', text: '1/2 ÷ 1/4 = ?', prompt: 'Flip the second fraction and multiply.', choices: ['2', '1/8', '4'], answer: '2', explanation: '1/2 ÷ 1/4 = 1/2 x 4/1 = 4/2 = 2 - meaning there are 2 quarters in a half.' },
      { id: 'f5-6', text: 'A jug holds 3/4 L. Each cup holds 1/8 L. How many cups fill the jug?', prompt: 'Divide 3/4 by 1/8.', choices: ['6 cups', '3 cups', '8 cups'], answer: '6 cups', explanation: '3/4 ÷ 1/8 = 3/4 x 8/1 = 24/4 = 6 cups.' }
    ]
  },

  addition_subtraction: {
    1: [
      { id: 'as1-1', text: '4 + 3 = ?', prompt: 'Count on from 4.', choices: ['7', '6', '8'], answer: '7', explanation: 'Starting at 4 and counting on 3 more: 5, 6, 7.' },
      { id: 'as1-2', text: '9 - 5 = ?', prompt: 'Count back from 9.', choices: ['4', '5', '3'], answer: '4', explanation: 'Starting at 9 and counting back 5: 8, 7, 6, 5, 4.' },
      { id: 'as1-3', text: '6 + 2 = ?', prompt: 'Count on from 6.', choices: ['8', '7', '9'], answer: '8', explanation: '6 and 2 more is 8.' },
      { id: 'as1-4', text: '10 - 4 = ?', prompt: 'Count back from 10.', choices: ['6', '5', '7'], answer: '6', explanation: '10 take away 4 leaves 6.' },
      { id: 'as1-5', text: 'You have 3 apples and get 4 more. How many now?', prompt: 'Add the two amounts.', choices: ['7', '6', '8'], answer: '7', explanation: '3 + 4 = 7 apples.' },
      { id: 'as1-6', text: '8 - 3 = ?', prompt: 'Count back from 8.', choices: ['5', '4', '6'], answer: '5', explanation: '8 take away 3 leaves 5.' }
    ],
    2: [
      { id: 'as2-1', text: '23 + 15 = ?', prompt: 'Add the tens, then the ones.', choices: ['38', '37', '48'], answer: '38', explanation: '20+10=30, 3+5=8, so 30+8=38.' },
      { id: 'as2-2', text: '47 - 23 = ?', prompt: 'Subtract the tens, then the ones.', choices: ['24', '25', '23'], answer: '24', explanation: '40-20=20, 7-3=4, so 20+4=24.' },
      { id: 'as2-3', text: '32 + 46 = ?', prompt: 'No carrying needed here - add each column.', choices: ['78', '77', '68'], answer: '78', explanation: '30+40=70, 2+6=8, so 70+8=78.' },
      { id: 'as2-4', text: '58 - 34 = ?', prompt: 'Subtract tens and ones separately.', choices: ['24', '23', '22'], answer: '24', explanation: '50-30=20, 8-4=4, so 20+4=24.' },
      { id: 'as2-5', text: '19 + 20 = ?', prompt: 'Add the tens and ones.', choices: ['39', '38', '40'], answer: '39', explanation: '19+20 = 10+20+9 = 39.' },
      { id: 'as2-6', text: '65 - 40 = ?', prompt: 'Subtract the tens only, ones stay the same.', choices: ['25', '24', '35'], answer: '25', explanation: '60-40=20, plus the 5 ones left gives 25.' }
    ],
    3: [
      { id: 'as3-1', text: '27 + 15 = ?', prompt: 'Adding the ones gives more than 10 - you will need to carry over.', choices: ['42', '32', '41'], answer: '42', explanation: '7+5=12, write 2 carry 1: 1+2+1=4, giving 42.' },
      { id: 'as3-2', text: '52 - 28 = ?', prompt: 'You cannot take 8 from 2 - borrow from the tens.', choices: ['24', '26', '34'], answer: '24', explanation: 'Borrow: 12-8=4, then 4-2=... (after borrowing) tens become 4-2=2 more careful: 52-28=24.' },
      { id: 'as3-3', text: '38 + 46 = ?', prompt: 'Ones: 8+6=14, carry the 1.', choices: ['84', '74', '94'], answer: '84', explanation: '8+6=14 (write 4 carry 1), 3+4+1=8, giving 84.' },
      { id: 'as3-4', text: '63 - 37 = ?', prompt: 'Borrow from the tens since 3 is less than 7.', choices: ['26', '36', '24'], answer: '26', explanation: 'Borrowing turns it into 13-7=6, and 5-3=2, giving 26.' },
      { id: 'as3-5', text: '45 + 39 = ?', prompt: 'Ones: 5+9=14, carry the 1 into the tens.', choices: ['84', '74', '94'], answer: '84', explanation: '5+9=14 (write 4 carry 1), 4+3+1=8, giving 84.' },
      { id: 'as3-6', text: '71 - 48 = ?', prompt: 'Borrow from the tens column.', choices: ['23', '33', '22'], answer: '23', explanation: 'Borrowing: 11-8=3, then 6-4=2, giving 23.' }
    ],
    4: [
      { id: 'as4-1', text: '234 + 158 = ?', prompt: 'Add ones, then tens, then hundreds, carrying as needed.', choices: ['392', '382', '402'], answer: '392', explanation: '4+8=12 (carry 1), 3+5+1=9, 2+1=3, giving 392.' },
      { id: 'as4-2', text: '506 - 278 = ?', prompt: 'Borrowing may be needed more than once here.', choices: ['228', '238', '218'], answer: '228', explanation: 'Working through the borrows carefully gives 506-278=228.' },
      { id: 'as4-3', text: '345 + 267 = ?', prompt: 'Add column by column with carrying.', choices: ['612', '602', '622'], answer: '612', explanation: '5+7=12 (carry1), 4+6+1=11 (carry1), 3+2+1=6, giving 612.' },
      { id: 'as4-4', text: 'A school has 428 students. 165 are girls. How many are boys?', prompt: 'Subtract girls from the total.', choices: ['263', '273', '253'], answer: '263', explanation: '428 - 165 = 263 boys.' },
      { id: 'as4-5', text: '199 + 1 = ?', prompt: 'What happens when all the 9s roll over?', choices: ['200', '199', '210'], answer: '200', explanation: 'Adding 1 to 199 rolls every digit over: 200.' },
      { id: 'as4-6', text: '300 - 145 = ?', prompt: 'Borrowing across zeros needs extra care.', choices: ['155', '165', '145'], answer: '155', explanation: '300-145=155, borrowing carefully across the zeros.' }
    ],
    5: [
      { id: 'as5-1', text: 'A shop had 1,240 pens. It sold 875. How many are left?', prompt: 'Subtract the sold amount from the total.', choices: ['365', '375', '355'], answer: '365', explanation: '1240 - 875 = 365 pens left.' },
      { id: 'as5-2', text: 'Add 3,458 + 2,769.', prompt: 'Work through each column with carrying.', choices: ['6,227', '6,127', '6,327'], answer: '6,227', explanation: '3458+2769 = 6227.' },
      { id: 'as5-3', text: 'A stadium holds 12,500 people. 8,764 tickets are sold. How many seats are free?', prompt: 'Subtract sold tickets from total capacity.', choices: ['3,736', '3,836', '3,636'], answer: '3,736', explanation: '12500 - 8764 = 3736 free seats.' },
      { id: 'as5-4', text: 'Find the missing number: 4,500 + ? = 7,200', prompt: 'Subtract 4,500 from 7,200 to find the gap.', choices: ['2,700', '2,800', '2,600'], answer: '2,700', explanation: '7200 - 4500 = 2700.' },
      { id: 'as5-5', text: 'Add 5,999 + 1.', prompt: 'What happens when the 9s roll over into thousands?', choices: ['6,000', '5,000', '6,999'], answer: '6,000', explanation: 'Adding 1 to 5999 rolls the digits: 6000.' },
      { id: 'as5-6', text: '10,000 - 4,325 = ?', prompt: 'Borrowing across multiple zeros.', choices: ['5,675', '5,775', '5,665'], answer: '5,675', explanation: '10000 - 4325 = 5675.' }
    ]
  },

  multiplication: {
    1: [
      { id: 'm1-1', text: '2 x 3 = ?', prompt: 'Think of 2 groups of 3.', choices: ['6', '5', '8'], answer: '6', explanation: '2 groups of 3 is 3+3=6.' },
      { id: 'm1-2', text: '4 x 2 = ?', prompt: 'Think of 4 groups of 2.', choices: ['8', '6', '10'], answer: '8', explanation: '4 groups of 2 is 2+2+2+2=8.' },
      { id: 'm1-3', text: '5 x 1 = ?', prompt: 'Anything times 1 stays the same.', choices: ['5', '1', '0'], answer: '5', explanation: 'Multiplying by 1 never changes the number.' },
      { id: 'm1-4', text: '3 x 3 = ?', prompt: 'Think of 3 groups of 3.', choices: ['9', '6', '12'], answer: '9', explanation: '3 groups of 3 is 3+3+3=9.' },
      { id: 'm1-5', text: 'There are 4 baskets with 2 apples each. How many apples total?', prompt: 'Multiply baskets by apples per basket.', choices: ['8', '6', '4'], answer: '8', explanation: '4 baskets x 2 apples = 8 apples.' },
      { id: 'm1-6', text: '5 x 0 = ?', prompt: 'Anything times 0 is always 0.', choices: ['0', '5', '1'], answer: '0', explanation: 'Multiplying by 0 always gives 0.' }
    ],
    2: [
      { id: 'm2-1', text: '6 x 4 = ?', prompt: 'Think of 6 groups of 4.', choices: ['24', '20', '28'], answer: '24', explanation: '6 x 4 = 24.' },
      { id: 'm2-2', text: '7 x 3 = ?', prompt: 'Think of 7 groups of 3.', choices: ['21', '24', '18'], answer: '21', explanation: '7 x 3 = 21.' },
      { id: 'm2-3', text: '8 x 2 = ?', prompt: 'Double 8.', choices: ['16', '14', '18'], answer: '16', explanation: '8 x 2 is the same as doubling 8, giving 16.' },
      { id: 'm2-4', text: '9 x 3 = ?', prompt: 'Think of 9 groups of 3, or 3 groups of 9.', choices: ['27', '24', '30'], answer: '27', explanation: '9 x 3 = 27.' },
      { id: 'm2-5', text: '6 x 6 = ?', prompt: 'A square number - 6 groups of 6.', choices: ['36', '32', '30'], answer: '36', explanation: '6 x 6 = 36.' },
      { id: 'm2-6', text: 'A van carries 5 boxes. Each box has 6 toys. How many toys total?', prompt: 'Multiply boxes by toys per box.', choices: ['30', '25', '35'], answer: '30', explanation: '5 x 6 = 30 toys.' }
    ],
    3: [
      { id: 'm3-1', text: '12 x 4 = ?', prompt: 'Break 12 into 10 + 2, multiply each part.', choices: ['48', '42', '46'], answer: '48', explanation: '10x4=40, 2x4=8, so 40+8=48.' },
      { id: 'm3-2', text: '15 x 3 = ?', prompt: 'Break 15 into 10 + 5.', choices: ['45', '40', '35'], answer: '45', explanation: '10x3=30, 5x3=15, so 30+15=45.' },
      { id: 'm3-3', text: '13 x 5 = ?', prompt: 'Break 13 into 10 + 3.', choices: ['65', '60', '55'], answer: '65', explanation: '10x5=50, 3x5=15, so 50+15=65.' },
      { id: 'm3-4', text: '11 x 7 = ?', prompt: 'Break 11 into 10 + 1.', choices: ['77', '70', '78'], answer: '77', explanation: '10x7=70, 1x7=7, so 70+7=77.' },
      { id: 'm3-5', text: 'A classroom has 14 rows of 3 chairs. How many chairs?', prompt: 'Multiply rows by chairs per row.', choices: ['42', '38', '45'], answer: '42', explanation: '14 x 3 = 42 chairs.' },
      { id: 'm3-6', text: '16 x 4 = ?', prompt: 'Break 16 into 10 + 6.', choices: ['64', '60', '68'], answer: '64', explanation: '10x4=40, 6x4=24, so 40+24=64.' }
    ],
    4: [
      { id: 'm4-1', text: '23 x 4 = ?', prompt: 'Multiply the ones, then the tens, then add.', choices: ['92', '82', '96'], answer: '92', explanation: '3x4=12 (carry1), 2x4=8, plus the carried 1 = 9, giving 92.' },
      { id: 'm4-2', text: '34 x 3 = ?', prompt: 'Multiply each digit by 3, carrying if needed.', choices: ['102', '92', '112'], answer: '102', explanation: '4x3=12 (carry1), 3x3=9+1=10, giving 102.' },
      { id: 'm4-3', text: 'A baker makes 25 cakes a day for 6 days. How many cakes total?', prompt: 'Multiply cakes per day by number of days.', choices: ['150', '140', '160'], answer: '150', explanation: '25 x 6 = 150 cakes.' },
      { id: 'm4-4', text: '42 x 5 = ?', prompt: 'Multiply each digit by 5.', choices: ['210', '200', '220'], answer: '210', explanation: '2x5=10 (carry1), 4x5=20+1=21, giving 210.' },
      { id: 'm4-5', text: '18 x 6 = ?', prompt: 'Multiply the ones, then the tens.', choices: ['108', '98', '118'], answer: '108', explanation: '8x6=48 (carry4), 1x6=6+4=10, giving 108.' },
      { id: 'm4-6', text: 'A parking lot has 27 rows with 4 cars each. How many cars?', prompt: 'Multiply rows by cars per row.', choices: ['108', '98', '118'], answer: '108', explanation: '27 x 4 = 108 cars.' }
    ],
    5: [
      { id: 'm5-1', text: '23 x 12 = ?', prompt: 'Break 12 into 10 + 2, multiply 23 by each, then add.', choices: ['276', '266', '286'], answer: '276', explanation: '23x10=230, 23x2=46, so 230+46=276.' },
      { id: 'm5-2', text: '34 x 21 = ?', prompt: 'Break 21 into 20 + 1.', choices: ['714', '704', '724'], answer: '714', explanation: '34x20=680, 34x1=34, so 680+34=714.' },
      { id: 'm5-3', text: 'A factory makes 145 toys a day for 12 days. How many toys total?', prompt: 'Break 12 into 10 + 2 to make it easier.', choices: ['1,740', '1,640', '1,840'], answer: '1,740', explanation: '145x10=1450, 145x2=290, so 1450+290=1740.' },
      { id: 'm5-4', text: '19 x 19 = ?', prompt: 'Break one 19 into 20 - 1.', choices: ['361', '351', '371'], answer: '361', explanation: '19x20=380, minus 19 (one extra group) gives 361.' },
      { id: 'm5-5', text: '25 x 16 = ?', prompt: 'Break 16 into 10 + 6.', choices: ['400', '390', '410'], answer: '400', explanation: '25x10=250, 25x6=150, so 250+150=400.' },
      { id: 'm5-6', text: 'A stadium has 48 rows with 22 seats each. How many seats total?', prompt: 'Break 22 into 20 + 2.', choices: ['1,056', '1,046', '1,066'], answer: '1,056', explanation: '48x20=960, 48x2=96, so 960+96=1056 seats.' }
    ]
  },

  decimals: {
    1: [
      { id: 'd1-1', text: 'What is 0.1 the same as?', prompt: 'A decimal tenth matches a familiar fraction.', choices: ['1/10', '1/100', '1/1'], answer: '1/10', explanation: '0.1 means one tenth, written as the fraction 1/10.' },
      { id: 'd1-2', text: 'Which is bigger: 0.5 or 0.2?', prompt: 'Think of them as fifths and tenths on a number line.', choices: ['0.5', '0.2', 'They are equal'], answer: '0.5', explanation: '0.5 is further right on the number line than 0.2, so it is bigger.' },
      { id: 'd1-3', text: 'What is 0.25 the same as?', prompt: 'A quarter written as a decimal.', choices: ['1/4', '1/2', '2/5'], answer: '1/4', explanation: '0.25 = 25/100, which simplifies to 1/4.' },
      { id: 'd1-4', text: 'Which decimal shows "half"?', prompt: 'Half of a whole in decimal form.', choices: ['0.5', '0.05', '5.0'], answer: '0.5', explanation: 'Half is 0.5, since 0.5 = 5/10 = 1/2.' },
      { id: 'd1-5', text: 'How many tenths are in 0.7?', prompt: 'The first digit after the decimal point is the tenths place.', choices: ['7', '70', '0.7'], answer: '7', explanation: '0.7 means 7 tenths.' },
      { id: 'd1-6', text: 'Which is smallest: 0.9, 0.3, 0.6?', prompt: 'Compare the tenths digit of each.', choices: ['0.3', '0.9', '0.6'], answer: '0.3', explanation: '0.3 has the smallest tenths digit, so it is the smallest number.' }
    ],
    2: [
      { id: 'd2-1', text: '0.2 + 0.3 = ?', prompt: 'Add the tenths together.', choices: ['0.5', '0.6', '0.23'], answer: '0.5', explanation: '2 tenths + 3 tenths = 5 tenths = 0.5.' },
      { id: 'd2-2', text: '0.6 - 0.4 = ?', prompt: 'Subtract the tenths.', choices: ['0.2', '0.1', '0.3'], answer: '0.2', explanation: '6 tenths - 4 tenths = 2 tenths = 0.2.' },
      { id: 'd2-3', text: '0.4 + 0.4 = ?', prompt: 'Add the tenths, watch for carrying into a whole.', choices: ['0.8', '0.44', '1.0'], answer: '0.8', explanation: '4 tenths + 4 tenths = 8 tenths = 0.8.' },
      { id: 'd2-4', text: '1.0 - 0.3 = ?', prompt: 'Think of 1.0 as 10 tenths.', choices: ['0.7', '0.6', '0.8'], answer: '0.7', explanation: '10 tenths - 3 tenths = 7 tenths = 0.7.' },
      { id: 'd2-5', text: '0.5 + 0.5 = ?', prompt: 'Two halves make a whole.', choices: ['1.0', '0.10', '0.55'], answer: '1.0', explanation: '5 tenths + 5 tenths = 10 tenths = 1.0, a whole.' },
      { id: 'd2-6', text: 'You have 0.7 L of juice and drink 0.2 L. How much is left?', prompt: 'Subtract the tenths.', choices: ['0.5 L', '0.9 L', '0.4 L'], answer: '0.5 L', explanation: '7 tenths - 2 tenths = 5 tenths = 0.5 L.' }
    ],
    3: [
      { id: 'd3-1', text: 'Which is bigger: 0.45 or 0.5?', prompt: 'Compare tenths first, then hundredths if needed.', choices: ['0.5', '0.45', 'They are equal'], answer: '0.5', explanation: '0.5 = 0.50, and 50 hundredths is more than 45 hundredths.' },
      { id: 'd3-2', text: '0.25 + 0.15 = ?', prompt: 'Add the hundredths, then the tenths.', choices: ['0.40', '0.30', '0.35'], answer: '0.40', explanation: '25 hundredths + 15 hundredths = 40 hundredths = 0.40.' },
      { id: 'd3-3', text: '0.6 written as hundredths is?', prompt: 'Tenths can always be rewritten as hundredths.', choices: ['0.60', '0.06', '0.6', ], answer: '0.60', explanation: '0.6 = 0.60 - adding a zero does not change the value.' },
      { id: 'd3-4', text: '0.75 - 0.25 = ?', prompt: 'Subtract the hundredths.', choices: ['0.50', '0.45', '0.60'], answer: '0.50', explanation: '75 hundredths - 25 hundredths = 50 hundredths = 0.50.' },
      { id: 'd3-5', text: 'Order from smallest: 0.3, 0.09, 0.31', prompt: 'Line up the decimal points and compare digit by digit.', choices: ['0.09, 0.3, 0.31', '0.3, 0.09, 0.31', '0.31, 0.3, 0.09'], answer: '0.09, 0.3, 0.31', explanation: '0.09 is less than 3 tenths, and 0.3 is less than 0.31.' },
      { id: 'd3-6', text: '0.4 + 0.09 = ?', prompt: 'Line up tenths and hundredths carefully.', choices: ['0.49', '0.13', '0.5'], answer: '0.49', explanation: '0.40 + 0.09 = 0.49.' }
    ],
    4: [
      { id: 'd4-1', text: '2.5 x 2 = ?', prompt: 'Multiply as if there is no decimal, then place it back.', choices: ['5.0', '4.5', '5.5'], answer: '5.0', explanation: '25 x 2 = 50, and placing the decimal back gives 5.0.' },
      { id: 'd4-2', text: '3.2 x 3 = ?', prompt: 'Multiply 32 by 3, then place the decimal.', choices: ['9.6', '9.2', '8.6'], answer: '9.6', explanation: '32 x 3 = 96, so 3.2 x 3 = 9.6.' },
      { id: 'd4-3', text: 'A pencil costs $1.5. How much do 4 pencils cost?', prompt: 'Multiply the price by the quantity.', choices: ['$6.0', '$5.5', '$6.5'], answer: '$6.0', explanation: '1.5 x 4 = 6.0 dollars.' },
      { id: 'd4-4', text: '4.5 - 1.2 = ?', prompt: 'Subtract whole numbers and decimals separately.', choices: ['3.3', '3.2', '3.7'], answer: '3.3', explanation: '4.5 - 1.2 = 3.3.' },
      { id: 'd4-5', text: '0.8 x 5 = ?', prompt: 'Multiply 8 by 5, then place the decimal.', choices: ['4.0', '3.5', '4.5'], answer: '4.0', explanation: '8 x 5 = 40, so 0.8 x 5 = 4.0.' },
      { id: 'd4-6', text: 'A ribbon is 2.4 m. You need 3 of them. How much ribbon total?', prompt: 'Multiply length by quantity.', choices: ['7.2 m', '6.2 m', '7.4 m'], answer: '7.2 m', explanation: '2.4 x 3 = 7.2 m.' }
    ],
    5: [
      { id: 'd5-1', text: '6.4 ÷ 2 = ?', prompt: 'Divide as if there is no decimal, then place it back.', choices: ['3.2', '3.0', '3.4'], answer: '3.2', explanation: '64 ÷ 2 = 32, so 6.4 ÷ 2 = 3.2.' },
      { id: 'd5-2', text: '7.5 ÷ 5 = ?', prompt: 'Divide 75 by 5, then place the decimal.', choices: ['1.5', '1.4', '1.6'], answer: '1.5', explanation: '75 ÷ 5 = 15, so 7.5 ÷ 5 = 1.5.' },
      { id: 'd5-3', text: 'A 9.6 m rope is cut into 4 equal pieces. How long is each piece?', prompt: 'Divide the total length by the number of pieces.', choices: ['2.4 m', '2.2 m', '2.6 m'], answer: '2.4 m', explanation: '9.6 ÷ 4 = 2.4 m each.' },
      { id: 'd5-4', text: 'Which is larger: 0.7 or 0.68?', prompt: 'Compare as hundredths: 0.70 vs 0.68.', choices: ['0.7', '0.68', 'They are equal'], answer: '0.7', explanation: '0.70 has more hundredths than 0.68.' },
      { id: 'd5-5', text: '12.6 ÷ 3 = ?', prompt: 'Divide 126 by 3, then place the decimal.', choices: ['4.2', '4.0', '4.4'], answer: '4.2', explanation: '126 ÷ 3 = 42, so 12.6 ÷ 3 = 4.2.' },
      { id: 'd5-6', text: 'A recipe needs 0.75 kg of flour split evenly into 3 bowls. How much per bowl?', prompt: 'Divide the total weight by the number of bowls.', choices: ['0.25 kg', '0.35 kg', '0.20 kg'], answer: '0.25 kg', explanation: '0.75 ÷ 3 = 0.25 kg per bowl.' }
    ]
  }
};

const warmup = {
  fractions: [
    { id: 'w-1', text: 'Which is bigger: 1/2 or 1/3?', choices: ['1/2', '1/3', 'They are equal'], answer: '1/2', difficulty: 2 },
    { id: 'w-2', text: '1/4 + 1/4 = ?', choices: ['1/2', '2/8', '1/4'], answer: '1/2', difficulty: 3 },
    { id: 'w-3', text: '3/4 - 1/2 = ?', choices: ['1/4', '1/2', '2/4'], answer: '1/4', difficulty: 4 }
  ],
  addition_subtraction: [
    { id: 'was-1', text: '8 + 5 = ?', choices: ['13', '12', '14'], answer: '13', difficulty: 2 },
    { id: 'was-2', text: '34 + 28 = ?', choices: ['62', '52', '61'], answer: '62', difficulty: 3 },
    { id: 'was-3', text: '506 - 278 = ?', choices: ['228', '238', '218'], answer: '228', difficulty: 4 }
  ],
  multiplication: [
    { id: 'wm-1', text: '4 x 3 = ?', choices: ['12', '10', '14'], answer: '12', difficulty: 2 },
    { id: 'wm-2', text: '12 x 4 = ?', choices: ['48', '42', '46'], answer: '48', difficulty: 3 },
    { id: 'wm-3', text: '23 x 4 = ?', choices: ['92', '82', '96'], answer: '92', difficulty: 4 }
  ],
  decimals: [
    { id: 'wd-1', text: 'Which is bigger: 0.5 or 0.2?', choices: ['0.5', '0.2', 'They are equal'], answer: '0.5', difficulty: 2 },
    { id: 'wd-2', text: '0.25 + 0.15 = ?', choices: ['0.40', '0.30', '0.35'], answer: '0.40', difficulty: 3 },
    { id: 'wd-3', text: '2.5 x 2 = ?', choices: ['5.0', '4.5', '5.5'], answer: '5.0', difficulty: 4 }
  ]
};

const SKILLS = [
  { id: 'fractions', label: 'Fractions', description: 'Halves, quarters, adding and comparing fractions' },
  { id: 'addition_subtraction', label: 'Addition & Subtraction', description: 'From single digits up to carrying and borrowing' },
  { id: 'multiplication', label: 'Multiplication', description: 'Times tables through two-digit multiplication' },
  { id: 'decimals', label: 'Decimals', description: 'Tenths, hundredths, and decimal arithmetic' }
];

function getSkills() {
  return SKILLS;
}

function getQuestionsForDifficulty(skill, difficulty) {
  const clamped = Math.max(1, Math.min(5, difficulty));
  return bank[skill]?.[clamped] || [];
}

function getWarmup(skill) {
  return warmup[skill] || [];
}

function findQuestion(skill, questionId) {
  for (let d = 1; d <= 5; d += 1) {
    const found = (bank[skill]?.[d] || []).find((q) => q.id === questionId);
    if (found) return found;
  }
  return (warmup[skill] || []).find((q) => q.id === questionId) || null;
}

module.exports = { getQuestionsForDifficulty, getWarmup, findQuestion, getSkills };
