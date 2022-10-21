import { Request, Response, NextFunction } from "express";
import { errorHandler } from "../Middleware/Errors/errorHandler.middleware";
import { groupService } from "../services/group.service";
import { t } from "i18next";

class GroupController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userInput = req.body;
      const payload = await groupService.validateCreateReturn(
        userInput,
        req.user?._id
      );
      res.status(201).json(payload);
    } catch (err) {
      errorHandler(err, req, res, next);
    }
  }
  async join(req: Request, res: Response, next: NextFunction) {
    try {
      const groupName = req.query.groupName?.toString().toUpperCase();
      const user = req.user;
      const payload = await groupService.joinGroup(groupName, user?._id);
      res.json(payload);
    } catch (err) {
      errorHandler(err, req, res, next);
    }
  }
  async getGroupRules(req: Request, res: Response, next: NextFunction) {
    try {
      const groupName = req.query.groupName?.toString();
      const payload = await groupService.fetchGroupRules(groupName);
      res.json(payload);
    } catch (err) {
      errorHandler(err, req, res, next);
    }
  }
  async getScores(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = await groupService.fetchGroupDataWithScores(
        req.user?._id,
        req.query.groupName?.toString()
      );
      res.json(payload);
    } catch (err) {
      errorHandler(err, req, res, next);
    }
  }
  async leaveGroup(req: Request, res: Response, next: NextFunction) {
    try {
      const groupName = req.query.groupName?.toString();
      const user = req.user;
      const removedId = await groupService.removeFromGroup(
        groupName,
        user?._id
      );
      res.json({
        message: t("User removed from group"),
        group_id: removedId,
      });
    } catch (err) {
      errorHandler(err, req, res, next);
    }
  }
  async deleteGroup(req: Request, res: Response, next: NextFunction) {
    try {
      const userGroupId = req.query.userGroupId?.toString();
      await groupService.removeGroup(userGroupId, req.user?._id);
      res.json({ message: t("Group deleted") });
    } catch (err) {
      errorHandler(err, req, res, next);
    }
  }
  async getGroupData(req: Request, res: Response, next: NextFunction) {
    try {
      const groupName = req.query.groupName?.toString();
      const payload = await groupService.fetchGroupData(
        groupName,
        req.user?._id
      );
      res.json(payload);
    } catch (err) {
      errorHandler(err, req, res, next);
    }
  }
}

export const groupController = new GroupController();
