import { BadRequestException } from '@nestjs/common';
import { MedalState } from '@prisma/client';

/**
 * Máquina de estados para validar transiciones de medallas
 * Asegura que solo se permitan transiciones válidas entre estados
 */
export class MedalStateMachine {
    // ✅ CAMBIO: Transiciones válidas desde cada estado (eliminado REGISTER_PROCESS)
    // Nota: Usamos 'as any' temporalmente hasta que Prisma regenere los tipos
    private static readonly VALID_TRANSITIONS: Partial<Record<MedalState, MedalState[]>> = {
        [MedalState.VIRGIN]: [MedalState.ENABLED], // ✅ Directamente a ENABLED
        [MedalState.INCOMPLETE]: [MedalState.ENABLED],
        [MedalState.ENABLED]: [MedalState.DISABLED, MedalState.DEAD],
        [MedalState.DISABLED]: [MedalState.ENABLED, MedalState.DEAD],
        [MedalState.DEAD]: [], // Estado final, no se puede cambiar
    } as Record<MedalState, MedalState[]>;

    /**
     * Valida si una transición de estado es válida
     * @param from - Estado actual
     * @param to - Estado destino
     * @throws BadRequestException si la transición no es válida
     */
    static validateTransition(from: MedalState, to: MedalState): void {
        // Permitir quedarse en el mismo estado (idempotencia)
        if (from === to) {
            return;
        }

        const validTargets = this.VALID_TRANSITIONS[from];
        
        if (!validTargets || !validTargets.includes(to)) {
            throw new BadRequestException(
                `Transición inválida: ${from} → ${to}. ` +
                `Transiciones válidas desde ${from}: ${validTargets.length > 0 ? validTargets.join(', ') : 'ninguna (estado final)'}`
            );
        }
    }

    /**
     * Obtiene los estados válidos desde un estado dado
     * @param from - Estado actual
     * @returns Array de estados válidos
     */
    static getValidTransitions(from: MedalState): MedalState[] {
        return this.VALID_TRANSITIONS[from] || [];
    }

    /**
     * Verifica si un estado es un estado final (no se puede cambiar)
     * @param state - Estado a verificar
     * @returns true si es estado final
     */
    static isFinalState(state: MedalState): boolean {
        return this.VALID_TRANSITIONS[state]?.length === 0;
    }

    /**
     * Verifica si se puede resetear una medalla desde un estado dado
     * @param state - Estado actual
     * @returns true si se puede resetear
     */
    static canReset(state: MedalState): boolean {
        // ✅ CAMBIO: Eliminado REGISTER_PROCESS, solo INCOMPLETE puede resetearse
        const resettableStates: MedalState[] = [MedalState.INCOMPLETE];
        return resettableStates.includes(state);
    }
}

