export const enablePathMethods = {
  get: [
    '/retrieveTraining/:idRol',
    '/retrievetrainingStatus/:idUser/:idTraining',
    '/retrievetrainingProgress/:idUser/:idTraining',
    '/retrievetrainingsections/:idTraining',
    '/retrievetrainingcontentorder/:idTrainingSection',
    '/retrievetrainingcontent/:idTrainingSection',
    '/retrievetrainingquizzesbytrainingid/:idTrainingSection',
    '/retrieveTraining/:roleCode',
    '/:filePath',
    '/retrievetraining/:roleCode/:user',
  ],
  post: [
    '/createcontentprogress',
    '/createquizscore',
    '/createprogresstraining',
    '/createquizresults',
  ],
  put: ['/updateuserquizscore/:id'],
  delete: [],
  patch: [],
};
