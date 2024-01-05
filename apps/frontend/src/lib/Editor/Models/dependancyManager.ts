import { makeObservable, observable } from 'mobx';
import { WebloomQuery } from './query';
import { WebloomWidget } from './widget';
type DependantPropName = string;
type DependancyPropName = string;
class DependancyManager {
  dependanciesByPropName: Map<
    DependantPropName,
    Map<WebloomWidget | WebloomQuery, Set<DependancyPropName>>
  >;
  dependancyByEntity: Map<
    WebloomWidget | WebloomQuery,
    Map<DependantPropName, Set<DependancyPropName>>
  >;
  dependantId: string;
  constructor(id: string) {
    this.dependantId = id;
    this.dependanciesByPropName = new Map();
    this.dependancyByEntity = new Map();
    makeObservable(this, {
      dependanciesByPropName: observable,
      dependancyByEntity: observable,
    });
  }

  getDependanciesByPropName(
    propName: DependantPropName,
  ): Map<WebloomWidget | WebloomQuery, Set<DependancyPropName>> | null {
    return this.dependanciesByPropName.get(propName) ?? null;
  }
  getDependancyByEntity(
    entity: WebloomWidget | WebloomQuery,
  ): Map<DependantPropName, Set<DependancyPropName>> | null {
    return this.dependancyByEntity.get(entity) ?? null;
  }

  addDependancy(
    dependantPropName: DependantPropName,
    dependancy: WebloomWidget | WebloomQuery,
    dependancyPropName: DependancyPropName,
  ) {
    let dependanciesByPropName =
      this.dependanciesByPropName.get(dependantPropName);
    if (!dependanciesByPropName) {
      dependanciesByPropName = new Map();
      this.dependanciesByPropName.set(
        dependantPropName,
        dependanciesByPropName,
      );
    }
    let dependancyByEntity = this.dependancyByEntity.get(dependancy);
    if (!dependancyByEntity) {
      dependancyByEntity = new Map();
      this.dependancyByEntity.set(dependancy, dependancyByEntity);
    }
    let dependancies = dependanciesByPropName.get(dependancy);
    if (!dependancies) {
      dependancies = new Set();
      dependanciesByPropName.set(dependancy, dependancies);
    }
    let dependants = dependancyByEntity.get(dependantPropName);
    if (!dependants) {
      dependants = new Set();
      dependancyByEntity.set(dependantPropName, dependants);
    }
    dependancies.add(dependancyPropName);
    dependants.add(dependantPropName);
  }
  removeDependancy(
    dependantPropName: DependantPropName,
    dependancy: WebloomWidget | WebloomQuery,
    dependancyPropName: DependancyPropName,
  ) {
    const dependanciesByPropName =
      this.dependanciesByPropName.get(dependantPropName);
    const dependancyByEntity = this.dependancyByEntity.get(dependancy);

    if (dependanciesByPropName && dependancyByEntity) {
      const dependancies = dependanciesByPropName.get(dependancy);
      const dependants = dependancyByEntity.get(dependantPropName);

      if (dependancies && dependants) {
        dependancies.delete(dependancyPropName);
        dependants.delete(dependantPropName);

        if (dependancies.size === 0) {
          dependanciesByPropName.delete(dependancy);
        }

        if (dependants.size === 0) {
          dependancyByEntity.delete(dependantPropName);
        }
      }
    }
  }
}
