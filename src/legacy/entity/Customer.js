/**
 * Customer class.
 */

export default class Customer {
  constructor(id) {
    this.id         = id;
    this.name       = null;
    this.alias      = null;
    this.paymentDay = null;
    this.type       = null;
    this.cnpj       = null;
    this.cpf        = null;
    this.email      = null;
  }

  isPerson() {
    return this.type === 'F';
  }
}
