import { EditorState } from './editor';
import { WorkerRequest, WorkerResponse } from './common/interface';
import { autorun, runInAction, toJS } from 'mobx';
import { compare } from 'fast-json-patch';
import { EntityErrorsRecord } from '../interface';

const editorState = new EditorState();

function receiveMessage(req: WorkerRequest) {
  if (req.event === 'batch') {
    req.body.forEach(eventSwitch);
  } else {
    eventSwitch(req);
  }
}
function eventSwitch(req: WorkerRequest) {
  const { event, body } = req as WorkerRequest;
  switch (event) {
    case 'init':
      try {
        editorState.init(body);
      } catch (error) {
        console.error('Error in init:', error);
      }
      break;
    case 'updateEntity':
      try {
        editorState.getEntityById(body.id).setValues(body.unevalValues);
      } catch (error) {
        console.error('Error in updateEntity:', error);
      }
      break;
    case 'removeEntity':
      try {
        editorState.removeEntity(body.id);
      } catch (error) {
        console.error('Error in removeEntity:', error);
      }
      break;
    case 'addEntity':
      try {
        editorState.addEntity(body);
      } catch (error) {
        console.error('Error in addEntity:', error);
      }
      break;
    case 'changePage':
      try {
        editorState.changePage(body.currentPageId);
      } catch (error) {
        console.error('Error in changePage:', error);
      }
      break;
  }
}
self.addEventListener('message', (e) => {
  const { data } = e;
  const { event, body } = data as WorkerRequest;
  console.log('worker received', event, body);
  runInAction(() => {
    receiveMessage(data);
  });
});
self.addEventListener('messageerror', (e) => {
  console.error('worker error', e);
});
self.addEventListener('error', (e) => {
  console.error('worker error', e);
});
let lastEvaluatedForest = {};
let lastErrors: EntityErrorsRecord = {};
autorun(() => {
  const serializedEvalForest = toJS(
    editorState.evaluationManager.evaluatedForest.evalTree,
  );
  const serializedErrors = toJS(
    editorState.evaluationManager.evaluatedForest.errors,
  );
  self.postMessage({
    event: 'EvaluationUpdate',
    body: {
      evaluationUpdates: compare(lastEvaluatedForest, serializedEvalForest),
      errorUpdates: compare(lastErrors, serializedErrors),
    },
  } as WorkerResponse);
  lastEvaluatedForest = serializedEvalForest;
  lastErrors = serializedErrors;
});
