import { Resolver } from '#engine/outbreak/resolver/Resolver'
import { ZombieIA } from '#engine/outbreak/entities/IA/ZombieIA'

export class ZombieResolver extends Resolver {
  boot (): void {
    this.embedded = {
      ...this.embedded,
      ia: { zombie: new ZombieIA(this.outbreak), }
    }
  }

  resolve (): void {
    this.log.profile('zombie')

    //this.embedded.ia.zombie.attack()
    this.embedded.ia.zombie.track()
    //this.embedded.ia.zombie.sniff()
    //this.embedded.ia.zombie.wander()

    this.log.profile('zombie', { message: '🧟 Zombies turn resolved', level: 'debug' })
  }
}
