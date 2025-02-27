import { Controller } from "@tsed/di";
import { Delete, Post, Put } from "@tsed/schema";
import { CREATE_911_CALL_EVENT } from "@snailycad/schemas";
import { BodyParams, PathParams } from "@tsed/platform-params";
import { NotFound } from "@tsed/exceptions";
import { prisma } from "lib/prisma";
import { Socket } from "services/SocketService";
import { UseBeforeEach } from "@tsed/platform-middlewares";
import { IsAuth } from "middlewares/IsAuth";
import { validateSchema } from "lib/validateSchema";
import { UsePermissions, Permissions } from "middlewares/UsePermissions";
import { callInclude } from "./Calls911Controller";
import { officerOrDeputyToUnit } from "lib/leo/officerOrDeputyToUnit";

@Controller("/911-calls/events")
@UseBeforeEach(IsAuth)
export class Calls911Controller {
  private socket: Socket;
  constructor(socket: Socket) {
    this.socket = socket;
  }

  @Post("/:callId")
  @UsePermissions({
    fallback: (u) => u.isDispatch || u.isLeo || u.isEmsFd,
    permissions: [Permissions.Dispatch, Permissions.Leo, Permissions.EmsFd],
  })
  async createCallEvent(@PathParams("callId") callId: string, @BodyParams() body: unknown) {
    const data = validateSchema(CREATE_911_CALL_EVENT, body);

    const call = await prisma.call911.findUnique({
      where: { id: callId },
      include: callInclude,
    });

    if (!call) {
      throw new NotFound("callNotFound");
    }

    const event = await prisma.call911Event.create({
      data: {
        call911Id: call.id,
        description: data.description,
      },
    });

    const normalizedCall = officerOrDeputyToUnit({
      ...call,
      events: [...call.events, event],
    });

    this.socket.emitUpdate911Call(normalizedCall);

    return event;
  }

  @Put("/:callId/:eventId")
  @UsePermissions({
    fallback: (u) => u.isDispatch || u.isLeo || u.isEmsFd,
    permissions: [Permissions.Dispatch, Permissions.Leo, Permissions.EmsFd],
  })
  async updateCallEvent(
    @PathParams("callId") callId: string,
    @PathParams("eventId") eventId: string,
    @BodyParams() body: unknown,
  ) {
    const data = validateSchema(CREATE_911_CALL_EVENT, body);

    const call = await prisma.call911.findUnique({
      where: { id: callId },
      include: callInclude,
    });

    if (!call) {
      throw new NotFound("callNotFound");
    }

    const event = await prisma.call911Event.findFirst({
      where: {
        id: eventId,
        call911Id: callId,
      },
    });

    if (!event) {
      throw new NotFound("eventNotFound");
    }

    const updatedEvent = await prisma.call911Event.update({
      where: {
        id: event.id,
      },
      data: {
        description: data.description,
      },
    });

    const updatedEvents = call.events.map((event) => {
      if (event.id === updatedEvent.id) {
        return updatedEvent;
      }
      return event;
    });

    const normalizedCall = officerOrDeputyToUnit({
      ...call,
      events: updatedEvents,
    });

    this.socket.emitUpdate911Call(normalizedCall);

    return updatedEvent;
  }

  @Delete("/:callId/:eventId")
  @UsePermissions({
    fallback: (u) => u.isDispatch || u.isLeo || u.isEmsFd,
    permissions: [Permissions.Dispatch, Permissions.Leo, Permissions.EmsFd],
  })
  async deleteCallEvent(
    @PathParams("callId") callId: string,
    @PathParams("eventId") eventId: string,
  ) {
    const call = await prisma.call911.findUnique({
      where: { id: callId },
      include: callInclude,
    });

    if (!call) {
      throw new NotFound("callNotFound");
    }

    const event = await prisma.call911Event.findFirst({
      where: {
        id: eventId,
        call911Id: callId,
      },
    });

    if (!event) {
      throw new NotFound("eventNotFound");
    }

    await prisma.call911Event.delete({
      where: { id: event.id },
    });

    const updatedEvents = call.events.filter((v) => v.id !== event.id);
    const normalizedCall = officerOrDeputyToUnit({ ...call, events: updatedEvents });

    this.socket.emitUpdate911Call(normalizedCall);

    return true;
  }
}
