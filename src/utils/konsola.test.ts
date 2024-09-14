import chalk from "chalk"
import { konsola, formatHeader } from "./konsola"
import { beforeAll, describe, expect, it, vi } from 'vitest'


describe('konsola', () => {
  describe('success', () => {
    it('should prompt an success message', () => {
      const consoleSpy = vi.spyOn(console, 'log')
      konsola.ok('Component A created succesfully') 

      expect(consoleSpy).toHaveBeenCalledWith(`${chalk.green('✔')} Component A created succesfully`)
    })
    
    it('should prompt an success message with header', () => {
      const consoleSpy = vi.spyOn(console, 'log')
      konsola.ok('Component A created succesfully', true)
      const successText =  chalk.bgGreen.bold.white(` Success `)

      expect(consoleSpy).toHaveBeenCalledWith(formatHeader(successText))
    })
  })
  describe('error', () => {
    it('should prompt an error message', () => {
      const consoleSpy = vi.spyOn(console, 'error')

      konsola.error(new Error('Oh gosh, this is embarrasing'))  
      expect(consoleSpy).toHaveBeenCalledWith(chalk.red(`Oh gosh, this is embarrasing`))
    })
    
    it('should prompt an error message with header', () => {
      const consoleSpy = vi.spyOn(console, 'error')
      konsola.error(new Error('Oh gosh, this is embarrasing'), true)
      const errorText =  chalk.bgRed.bold.white(` Error `)
  
      expect(consoleSpy).toHaveBeenCalledWith(formatHeader(errorText))
    })
  })
})