// import { Injectable } from '@nestjs/common';
// import { examType } from 'src/assessment/infrastructure/model/question';

// @Injectable()
// export class ExamTypeService {
//   constructor(
//     private readonly quizRepository: QuizRepo,
//     private readonly finalRepository: FinalRepo,
//   ) {}

//   private readonly examLookup: Record<examType, (id: number) => Promise<any>> =
//     {
//       [examType.QUIZ]: (id) => this.quizRepository.findQuizById(id),
//       [examType.FINAL]: (id) => this.finalRepository.findFinalById(id),
//     };

//   /**
//    *
//    * @param type
//    * @param id
//    *
//    *  check exam is found in db
//    */

//   getQuestionsRecord(type: examType, id: number) {
//     return this.examLookup[type](id);
//   }

//   getAssessmentConfig(type: examType, id: number) {
//     return this.examConfigLookup[type](id);
//   }

//   private readonly examConfigLookup: Record<examType, (id: number) => Promise<any>> = {
//     [examType.QUIZ]: (id) => this.quizRepository.findConfigurationById(id),
//     [examType.FINAL]: (id) => this.finalRepository.findConfigurationById(id),
//   };
// }
