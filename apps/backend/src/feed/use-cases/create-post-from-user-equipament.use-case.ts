import { Injectable } from '@nestjs/common';

/**
 * Reservado para: após o usuário cadastrar um equipamento, opcionalmente criar
 * um `Post` de feed com `kind: 'equipment_share'`, `userEquipamentId` e
 * `message`/`shareSummary` (ex.: "Fulano cadastrou [descrição]").
 * Não integrado a rotas; quando o front tiver o modal, injete `CreatePostUseCase`
 * (ou o repositório) a partir de `CreateUserEquipamentUseCase` / controller.
 */
@Injectable()
export class CreatePostFromUserEquipamentUseCase {
  // Implementação intencionalmente adiada.
}
