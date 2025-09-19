import { createContext } from 'react';

import IRegistryItem from '../interfaces/registry';
import { elementsCollide } from '../utils/pos';

export class Registry {
  public map = new Map<number, IRegistryItem>();

  private selectedLength: number;

  constructor(public boxRef: React.RefObject<HTMLDivElement>) {}

  public register(item: IRegistryItem) {
    this.map.set(item.id, item);
  }

  public unregister(id: number) {
    this.map.delete(id);
  }

  public getSelected = () => {
    const boxRect = this.boxRef.current.getBoundingClientRect();
    const selected: any[] = [];
    const selectedItemRefs: any[] = [];

    this.map.forEach((r: IRegistryItem) => {
      const itemBox = r.ref.getBoundingClientRect();
      const collides = elementsCollide(r.ref.getBoundingClientRect(), boxRect);
      if (collides) {
        selected.push(r.data);
        selectedItemRefs.push( r.ref);
      }
    });

    if (selected.length !== this.selectedLength) {
      this.selectedLength = selected.length;
      return [selected, selectedItemRefs];
    }

    return null;
  };
}

export const RegistryContext = createContext<Registry>(null);
