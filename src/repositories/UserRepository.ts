import { User } from "../models/User";
import createError from "http-errors";

export class UserRepository { // Definizione della classe UserRepository per gestire le operazioni sul modello User
  async findById(id: number) {   // Metodo per trovare un utente User per ID
    return User.findByPk(id);
  }

  async findByEmail(email: string) { // Metodo per trovare un utente User per email
    return User.findOne({ where: { email } });
  }

  async decreaseTokens(userId: number, amount: number) { // Metodo per diminuire il numero di token di un utente User specifico
    const user = await User.findByPk(userId);
    if (!user) throw createError.NotFound("Utente non trovato");

    if (user.tokens < amount) {
     throw createError.Unauthorized("Non hai abbastanza token per completare questa operazione");
    }

    user.tokens -= amount;
    await user.save();

    return user.tokens; // Ritorna il nuovo saldo dei token
  }

  async addTokensByEmail(email: string, amount: number) {// Metodo per aggiungere token a un utente User specifico tramite email
    const user = await this.findByEmail(email);
    if (!user) {
      throw createError.NotFound("Utente non trovato");
    }
    
    //  Impedire la ricarica per gli admin
    if (user.role === "admin") {
    throw createError.BadRequest("Non è possibile ricaricare un account amministratore");
    }

    user.tokens += amount; 
    await user.save();
    return user;
  }
}