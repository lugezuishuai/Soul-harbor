import { points } from './core';
import { OpenModalOptions, ModalController, OpenDrawerOptions, DrawerController } from './types';
import { autoMount } from './extra-mount';
import { useWidgetManager } from './core';
import { injectOpenWidget } from './inject';

export async function openWidget<P>(options: OpenModalOptions<P>, type: 'modal'): Promise<ModalController<P>>;
export async function openWidget<P>(
  options: OpenDrawerOptions<P>,
  type: 'drawer'
): Promise<DrawerController<P>>;
export async function openWidget<P>(type: 'modal', options: OpenModalOptions<P>): Promise<ModalController<P>>;
export async function openWidget<P>(
  type: 'drawer',
  options: OpenDrawerOptions<P>
): Promise<DrawerController<P>>;

export async function openWidget(arg1: any, arg2: any) {
  const options = typeof arg1 === 'string' ? arg2 : arg1;
  const type = typeof arg1 === 'string' ? arg1 : arg2;
  const length = points.length;
  if (length) {
    const res = await (points[length - 1] as any)(options, type);
    return res;
  }
  const res = await new Promise<any>((resolve) => {
    autoMount(async () => {
      resolve(await openWidget(options, type));
    });
  });
  return res;
}

openWidget.injectOpenWidget = injectOpenWidget;
openWidget.useWidgetManager = useWidgetManager;
