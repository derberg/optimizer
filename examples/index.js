// eslint-disable-next-line @typescript-eslint/no-var-requires
const { Optimizer } = require('../lib/Optimizer')

const yaml = `
asyncapi: 2.0.0
info:
  title: Streetlights API
  version: '1.0.0'
channels:
  smartylighting/event/{streetlightId}/lighting/measured:
    parameters:
      #this parameter is duplicated. it can be moved to components and ref-ed from here.
      streetlightId:
        schema:
          type: string
    subscribe:
      operationId: receiveLightMeasurement
      traits:
        - bindings:
            kafka:
              clientId: my-app-id
      message:
        name: lightMeasured
        title: Light measured
        contentType: application/json
        traits:
          - headers:
              type: object
              properties:
                my-app-header:
                  type: integer
                  minimum: 0
                  maximum: 100
        payload:
          type: object
          properties:
            lumens:
              type: integer
              minimum: 0
            #full form is used, we can ref it to: #/components/schemas/sentAt
            sentAt:
              type: string
              format: date-time
  smartylighting/action/{streetlightId}/turn/on:
    parameters:
      streetlightId:
        schema:
          type: string
    publish:
      operationId: turnOn
      traits:
        - bindings:
            kafka:
              clientId: my-app-id
      message:
        name: turnOnOff
        title: Turn on/off
        traits:
          - headers:
              type: object
              properties:
                my-app-header:
                  type: integer
                  minimum: 0
                  maximum: 100
        payload:
          type: object
          properties:
            sentAt:
              $ref: "#/components/schemas/sentAt"
components:
  messages:
    #libarary should be able to find and delete this message, because it is not used anywhere.
    unusedMessage:
      name: unusedMessage
      title: This message is not used in any channel.
      
  schemas:
    #this schema is ref-ed in one channel and used full form in another. library should be able to identify and ref the second channel as well.
    sentAt:
      type: string
      format: date-time`
const optimizer = new Optimizer(yaml)
optimizer.getReport().then((report) => {
  //console.log(JSON.stringify(report))
  const optimizedDocument = optimizer.getOptimizedDocument({
    rules: {
      reuseComponents: true,
      removeComponents: true,
      moveToComponents: true,
    },
  })
  console.log(optimizedDocument)
})
