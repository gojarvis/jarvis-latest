getObjectives

objective -> getParameters

parameter - question


class HistoryGoal{
  constructor(){

  }


}



  async resolveObjectives(goal){
    let self = this;
    let objectives = goal.getObjectives()


    //Async, resolves objectives.
    let resolvedObjectives = Promise.all(objective.map(objective => {
      return await self.resolveObjectives(objective)
    }))
  }

  async resolveObjectives(objective){
    if (objective.resolved) return objective;


    // let resolvedParamaeters = Promise.all(objective.parameters.map(parameter => {
    //     if (!parameter.resolved){
    //
    //     }
    // }))
  }

  handleParameterFetched()
